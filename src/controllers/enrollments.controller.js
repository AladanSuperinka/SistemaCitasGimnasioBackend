const pool = require("../db");

// GET /api/enrollments/available
async function listAvailableSchedules(req, res) {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    let where = "";
    const params = [];

    if (role === "INSTRUCTOR") {
      where = "WHERE s.instructor_id = ?";
      params.push(userId);
    }

    const [rows] = await pool.query(
      `
      SELECT
        s.id AS schedule_id,
        c.id AS class_id,
        c.name AS class_name,
        c.level,
        c.capacity,
        a.email AS instructor_email,
        s.instructor_id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.room,
        COUNT(e.id) AS enrolled,
        (c.capacity - COUNT(e.id)) AS spots_left
      FROM schedules s
      INNER JOIN classes c ON c.id = s.class_id
      INNER JOIN admins a ON a.id = s.instructor_id
      LEFT JOIN enrollments e ON e.schedule_id = s.id
      ${where}
      GROUP BY s.id
      HAVING spots_left > 0
      ORDER BY c.name ASC, s.day_of_week ASC, s.start_time ASC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error("listAvailableSchedules error:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// POST /api/enrollments
async function createEnrollment(req, res) {
  try {
    const { student_id, schedule_id } = req.body;

    if (!student_id || !schedule_id) {
      return res.status(400).json({ message: "student_id y schedule_id son obligatorios" });
    }

    // validar alumno
    const [[student]] = await pool.query(`SELECT id FROM students WHERE id = ?`, [student_id]);
    if (!student) return res.status(404).json({ message: "Alumno no existe" });

    // validar schedule
    const [[sch]] = await pool.query(
      `
      SELECT s.id, s.instructor_id, c.capacity
      FROM schedules s
      INNER JOIN classes c ON c.id = s.class_id
      WHERE s.id = ?
      `,
      [schedule_id]
    );
    if (!sch) return res.status(404).json({ message: "Horario no existe" });

    //permisos: instructor solo puede inscribir en SU schedule
    if (req.user?.role === "INSTRUCTOR" && sch.instructor_id !== req.user.id) {
      return res.status(403).json({ message: "No autorizado para inscribir en este horario" });
    }

    // validar cupo
    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS enrolled FROM enrollments WHERE schedule_id = ?`,
      [schedule_id]
    );

    if (countRow.enrolled >= sch.capacity) {
      return res.status(409).json({ message: "Horario sin cupos disponibles" });
    }

    // 5) insertar (si tienes UNIQUE(student_id, schedule_id) te protege)
    try {
      const [result] = await pool.query(
        `INSERT INTO enrollments (student_id, schedule_id) VALUES (?, ?)`,
        [student_id, schedule_id]
      );
      res.status(201).json({ id: result.insertId, student_id, schedule_id });
    } catch (err) {
      if (err?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "El alumno ya está inscrito en este horario" });
      }
      console.error(err);
      res.status(500).json({ message: "Error en el servidor" });
    }
  } catch (err) {
    console.error("createEnrollment error:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// ✅ GET /api/enrollments
// Lista inscripciones (ADMIN todo, INSTRUCTOR solo las suyas)
async function listEnrollments(req, res) {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    let where = "";
    const params = [];

    if (role === "INSTRUCTOR") {
      where = "WHERE s.instructor_id = ?";
      params.push(userId);
    }

    const [rows] = await pool.query(
      `
      SELECT
        e.id AS enrollment_id,
        st.id AS student_id,
        CONCAT(st.first_name,' ',st.last_name) AS student_name,
        s.id AS schedule_id,
        c.id AS class_id,
        c.name AS class_name,
        c.level,
        a.email AS instructor_email,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.room,
        e.created_at
      FROM enrollments e
      INNER JOIN students st ON st.id = e.student_id
      INNER JOIN schedules s ON s.id = e.schedule_id
      INNER JOIN classes c ON c.id = s.class_id
      INNER JOIN admins a ON a.id = s.instructor_id
      ${where}
      ORDER BY e.id DESC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error("listEnrollments error:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// ✅ DELETE /api/enrollments/:id
async function deleteEnrollment(req, res) {
  try {
    const { id } = req.params;

    const [[row]] = await pool.query(
      `
      SELECT e.id, e.student_id, e.schedule_id, s.instructor_id
      FROM enrollments e
      INNER JOIN schedules s ON s.id = e.schedule_id
      WHERE e.id = ?
      `,
      [id]
    );

    if (!row) return res.status(404).json({ message: "Inscripción no existe" });

    if (req.user?.role === "INSTRUCTOR" && row.instructor_id !== req.user.id) {
      return res.status(403).json({ message: "No autorizado para cancelar esta inscripción" });
    }

    await pool.query(`DELETE FROM enrollments WHERE id = ?`, [id]);
    res.json({ message: "Inscripción cancelada" });
  } catch (err) {
    console.error("deleteEnrollment error:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// ✅ PUT /api/enrollments/:id
// Modificar inscripción: cambiar schedule_id -> new_schedule_id
async function updateEnrollment(req, res) {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { new_schedule_id } = req.body;

    if (!new_schedule_id) {
      return res.status(400).json({ message: "new_schedule_id es obligatorio" });
    }

    await conn.beginTransaction();

    // 1) Traer la inscripción actual + instructor dueño
    const [[enr]] = await conn.query(
      `
      SELECT e.id, e.student_id, e.schedule_id, s.instructor_id
      FROM enrollments e
      INNER JOIN schedules s ON s.id = e.schedule_id
      WHERE e.id = ?
      FOR UPDATE
      `,
      [id]
    );

    if (!enr) {
      await conn.rollback();
      return res.status(404).json({ message: "Inscripción no existe" });
    }

    // 2) Permisos (instructor solo si es de su schedule actual)
    if (req.user?.role === "INSTRUCTOR" && enr.instructor_id !== req.user.id) {
      await conn.rollback();
      return res.status(403).json({ message: "No autorizado para modificar esta inscripción" });
    }

    // si no cambia, ok
    if (Number(enr.schedule_id) === Number(new_schedule_id)) {
      await conn.rollback();
      return res.json({ message: "No hay cambios (mismo horario)" });
    }

    // 3) Validar nuevo schedule + capacidad + permisos
    const [[sch]] = await conn.query(
      `
      SELECT s.id, s.instructor_id, c.capacity
      FROM schedules s
      INNER JOIN classes c ON c.id = s.class_id
      WHERE s.id = ?
      FOR UPDATE
      `,
      [new_schedule_id]
    );

    if (!sch) {
      await conn.rollback();
      return res.status(404).json({ message: "Nuevo horario no existe" });
    }

    // instructor: solo puede mover hacia un schedule suyo
    if (req.user?.role === "INSTRUCTOR" && sch.instructor_id !== req.user.id) {
      await conn.rollback();
      return res.status(403).json({ message: "No autorizado para mover a ese horario" });
    }

    // 4) evitar duplicado (si ya está inscrito ese alumno en ese horario)
    const [[dup]] = await conn.query(
      `SELECT id FROM enrollments WHERE student_id = ? AND schedule_id = ? LIMIT 1`,
      [enr.student_id, new_schedule_id]
    );

    if (dup) {
      await conn.rollback();
      return res.status(409).json({ message: "El alumno ya está inscrito en ese horario" });
    }

    // 5) validar cupo del nuevo schedule
    const [[countRow]] = await conn.query(
      `SELECT COUNT(*) AS enrolled FROM enrollments WHERE schedule_id = ?`,
      [new_schedule_id]
    );

    if (countRow.enrolled >= sch.capacity) {
      await conn.rollback();
      return res.status(409).json({ message: "El nuevo horario ya no tiene cupos" });
    }

    // 6) actualizar
    await conn.query(`UPDATE enrollments SET schedule_id = ? WHERE id = ?`, [new_schedule_id, id]);

    await conn.commit();
    res.json({ message: "Inscripción modificada", enrollment_id: id, new_schedule_id });
  } catch (err) {
    await conn.rollback();

    // Si te salta por UNIQUE, se controla acá también
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El alumno ya está inscrito en ese horario" });
    }

    console.error("updateEnrollment error:", err);
    res.status(500).json({ message: "Error en el servidor" });
  } finally {
    conn.release();
  }
}

module.exports = {
  listAvailableSchedules,
  createEnrollment,
  listEnrollments,
  deleteEnrollment,
  updateEnrollment,
};
