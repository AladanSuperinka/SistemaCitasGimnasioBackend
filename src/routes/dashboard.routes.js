const express = require("express");
const router = express.Router();
const db = require("../db"); // <- cambia esto si tu conexión se llama distinto

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    const [[students]] = await db.query("SELECT COUNT(*) AS n FROM students");
    const [[classes]] = await db.query("SELECT COUNT(*) AS n FROM classes");
    const [[schedules]] = await db.query("SELECT COUNT(*) AS n FROM schedules");
    const [[enrollments]] = await db.query("SELECT COUNT(*) AS n FROM enrollments");

    // ✅ capacity NO está en schedules, está en classes
    // total_capacity = SUM(classes.capacity) por cada schedule
    const [[cap]] = await db.query(`
      SELECT COALESCE(SUM(c.capacity),0) AS total_capacity
      FROM schedules s
      JOIN classes c ON c.id = s.class_id
    `);

    // ✅ cupos libres totales = SUM(classes.capacity - inscritos_por_horario)
    // Usamos LEFT JOIN para incluir horarios sin inscritos
    const [[spots]] = await db.query(`
      SELECT COALESCE(SUM(c.capacity - IFNULL(x.enrolled, 0)),0) AS total_spots_left
      FROM schedules s
      JOIN classes c ON c.id = s.class_id
      LEFT JOIN (
        SELECT schedule_id, COUNT(*) AS enrolled
        FROM enrollments
        GROUP BY schedule_id
      ) x ON x.schedule_id = s.id
    `);

    res.json({
      students: Number(students.n || 0),
      classes: Number(classes.n || 0),
      schedules: Number(schedules.n || 0),
      enrollments: Number(enrollments.n || 0),
      total_capacity: Number(cap.total_capacity || 0),
      total_spots_left: Number(spots.total_spots_left || 0),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en stats" });
  }
});

// GET /api/dashboard/top-classes
router.get("/top-classes", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.id AS class_id, c.name AS class_name, c.level, COUNT(e.id) AS enrolled
      FROM enrollments e
      JOIN schedules s ON s.id = e.schedule_id
      JOIN classes c ON c.id = s.class_id
      GROUP BY c.id, c.name, c.level
      ORDER BY enrolled DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en top-classes" });
  }
});

// GET /api/dashboard/top-schedules
router.get("/top-schedules", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.id AS schedule_id,
        c.name AS class_name,
        c.level,
        a.email AS instructor_email,
        s.day_of_week,
        s.start_time,
        s.end_time,
        c.capacity AS capacity,
        COUNT(e.id) AS enrolled,
        (c.capacity - COUNT(e.id)) AS spots_left
      FROM schedules s
      JOIN classes c ON c.id = s.class_id
      JOIN admins a ON a.id = s.instructor_id
      LEFT JOIN enrollments e ON e.schedule_id = s.id
      GROUP BY
        s.id,
        c.name,
        c.level,
        a.email,
        s.day_of_week,
        s.start_time,
        s.end_time,
        c.capacity
      ORDER BY enrolled DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en top-schedules" });
  }
});


module.exports = router;
