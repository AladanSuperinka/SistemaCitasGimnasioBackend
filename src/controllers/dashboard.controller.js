
const pool = require("../db");

async function getDashboard(req, res) {
  try {
    const role = req.user?.role;
    const instructorId = req.user?.id; 

    const isInstructor = role === "INSTRUCTOR";

    // ----- KPI base -----
    const [[studentsRow]] = await pool.query(`SELECT COUNT(*) AS total FROM students`);
    const [[classesRow]] = await pool.query(`SELECT COUNT(*) AS total FROM classes`);

    // ----- KPI schedules 
    const [schCountRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM schedules s
      ${isInstructor ? "WHERE s.instructor_id = ?" : ""}
      `,
      isInstructor ? [instructorId] : []
    );
    const schedulesTotal = schCountRows[0]?.total ?? 0;

    // ----- KPI enrollments 
    const [enCountRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM enrollments e
      INNER JOIN schedules s ON s.id = e.schedule_id
      ${isInstructor ? "WHERE s.instructor_id = ?" : ""}
      `,
      isInstructor ? [instructorId] : []
    );
    const enrollmentsTotal = enCountRows[0]?.total ?? 0;

    // ----- Ocupación (capacidad total vs inscritos) ----
    const [occRows] = await pool.query(
      `
      SELECT
        COALESCE(SUM(c.capacity),0) AS capacity_total,
        COALESCE(COUNT(e.id),0)     AS enrolled_total
      FROM schedules s
      INNER JOIN classes c ON c.id = s.class_id
      LEFT JOIN enrollments e ON e.schedule_id = s.id
      ${isInstructor ? "WHERE s.instructor_id = ?" : ""}
      `,
      isInstructor ? [instructorId] : []
    );

    const capacityTotal = Number(occRows[0]?.capacity_total ?? 0);
    const enrolledTotal = Number(occRows[0]?.enrolled_total ?? 0);
    const spotsLeftTotal = Math.max(capacityTotal - enrolledTotal, 0);

    // ----- Resumen por clase (inscritos) -----
    const [byClass] = await pool.query(
      `
      SELECT
        c.id AS class_id,
        c.name AS class_name,
        c.level AS class_level,
        COUNT(e.id) AS enrolled
      FROM schedules s
      INNER JOIN classes c ON c.id = s.class_id
      LEFT JOIN enrollments e ON e.schedule_id = s.id
      ${isInstructor ? "WHERE s.instructor_id = ?" : ""}
      GROUP BY c.id, c.name, c.level
      ORDER BY enrolled DESC, c.name ASC
      LIMIT 10
      `,
      isInstructor ? [instructorId] : []
    );

    // ----- Top horarios (más demandados) -----
    const [topSchedules] = await pool.query(
      `
      SELECT
        s.id AS schedule_id,
        c.name AS class_name,
        c.level AS class_level,
        a.email AS instructor_email,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.room,
        c.capacity,
        COUNT(e.id) AS enrolled,
        (c.capacity - COUNT(e.id)) AS spots_left
      FROM schedules s
      INNER JOIN classes c ON c.id = s.class_id
      INNER JOIN admins  a ON a.id = s.instructor_id
      LEFT JOIN enrollments e ON e.schedule_id = s.id
      ${isInstructor ? "WHERE s.instructor_id = ?" : ""}
      GROUP BY s.id, c.name, c.level, a.email, s.day_of_week, s.start_time, s.end_time, s.room, c.capacity
      ORDER BY enrolled DESC, s.id DESC
      LIMIT 8
      `,
      isInstructor ? [instructorId] : []
    );

    res.json({
      kpis: {
        students: Number(studentsRow.total),
        classes: Number(classesRow.total),
        schedules: Number(schedulesTotal),
        enrollments: Number(enrollmentsTotal),
        occupancy: {
          capacity_total: capacityTotal,
          enrolled_total: enrolledTotal,
          spots_left_total: spotsLeftTotal,
        },
      },
      byClass,
      topSchedules,
    });
  } catch (err) {
    console.error("dashboard error:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

module.exports = { getDashboard };
