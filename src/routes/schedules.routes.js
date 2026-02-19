const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

const isAdmin = (req) => req.user?.role === "ADMIN";
const canRead = (req) => req.user?.role === "ADMIN" || req.user?.role === "INSTRUCTOR";


router.get("/", auth, async (req, res) => {
  try {
    if (!canRead(req)) return res.status(403).json({ message: "No autorizado" });

   

    const sql = `
      SELECT
        s.id,
        s.class_id,
        c.name AS class_name,
        c.level AS class_level,
        s.instructor_id,
        a.email AS instructor_email,
        a.role AS instructor_role,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.room,
        s.created_at
      FROM schedules s
      JOIN classes c ON c.id = s.class_id
      JOIN admins a ON a.id = s.instructor_id
      WHERE (? = 0 OR s.instructor_id = ?) 
      ORDER BY FIELD(s.day_of_week,'LUN','MAR','MIE','JUE','VIE','SAB','DOM'), s.start_time ASC
    `;

    

    const onlyMine = req.user.role === "INSTRUCTOR" ? 1 : 0;
    const [rows] = await pool.query(sql, [onlyMine, req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


router.post("/", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Solo ADMIN puede crear horarios" });

    const { class_id, instructor_id, day_of_week, start_time, end_time, room } = req.body;

    if (!class_id || !instructor_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    
    const [classRows] = await pool.query("SELECT id FROM classes WHERE id = ?", [class_id]);
    if (classRows.length === 0) return res.status(400).json({ message: "class_id no existe" });

    
    const [instRows] = await pool.query("SELECT id, role FROM admins WHERE id = ?", [instructor_id]);
    if (instRows.length === 0) return res.status(400).json({ message: "instructor_id no existe" });
    if (instRows[0].role !== "INSTRUCTOR") {
      return res.status(400).json({ message: "El instructor_id no tiene rol INSTRUCTOR" });
    }

    
    if (start_time >= end_time) {
      return res.status(400).json({ message: "start_time debe ser menor que end_time" });
    }

    const [result] = await pool.query(
      `INSERT INTO schedules (class_id, instructor_id, day_of_week, start_time, end_time, room)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [class_id, instructor_id, day_of_week, start_time, end_time, room || null]
    );

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// PUT /api/schedules/:id  
router.put("/:id", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Solo ADMIN puede editar horarios" });

    const { id } = req.params;
    const { class_id, instructor_id, day_of_week, start_time, end_time, room } = req.body;

    if (!class_id || !instructor_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Validar que el horario exista
    const [schRows] = await pool.query("SELECT id FROM schedules WHERE id = ?", [id]);
    if (schRows.length === 0) return res.status(404).json({ message: "Horario no encontrado" });

    // Validar clase
    const [classRows] = await pool.query("SELECT id FROM classes WHERE id = ?", [class_id]);
    if (classRows.length === 0) return res.status(400).json({ message: "class_id no existe" });

    // Validar instructor
    const [instRows] = await pool.query("SELECT id, role FROM admins WHERE id = ?", [instructor_id]);
    if (instRows.length === 0) return res.status(400).json({ message: "instructor_id no existe" });
    if (instRows[0].role !== "INSTRUCTOR") {
      return res.status(400).json({ message: "El instructor_id no tiene rol INSTRUCTOR" });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ message: "start_time debe ser menor que end_time" });
    }

    await pool.query(
      `UPDATE schedules
       SET class_id = ?, instructor_id = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ?
       WHERE id = ?`,
      [class_id, instructor_id, day_of_week, start_time, end_time, room || null, id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// DELETE /api/schedules/:id  
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Solo ADMIN puede eliminar horarios" });

    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM schedules WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Horario no encontrado" });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
