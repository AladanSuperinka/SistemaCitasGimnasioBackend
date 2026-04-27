const express = require("express");
const router = express.Router();

const db = require("../db");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Todo el dashboard queda protegido.
// Solo ADMIN puede ver estadísticas generales.
router.use(auth, authorize("ADMIN"));

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    const [[students]] = await db.query("SELECT COUNT(*) AS n FROM students");
    const [[classes]] = await db.query("SELECT COUNT(*) AS n FROM classes");
    const [[schedules]] = await db.query("SELECT COUNT(*) AS n FROM schedules");
    const [[enrollments]] = await db.query("SELECT COUNT(*) AS n FROM enrollments");

    // total_capacity = SUM(capacity de la clase por cada horario creado)
    const [[cap]] = await db.query(`
      SELECT COALESCE(SUM(c.capacity), 0) AS total_capacity
      FROM schedules s
      INNER JOIN classes c ON c.id = s.class_id
    `);

    // cupos libres totales = SUM(capacidad de clase - inscritos por horario)
    const [[spots]] = await db.query(`
      SELECT COALESCE(SUM(c.capacity - IFNULL(x.enrolled, 0)), 0) AS total_spots_left
      FROM schedules s
      INNER JOIN classes c ON c.id = s.class_id
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
  } catch (error) {
    console.error("dashboard stats error:", error);
    res.status(500).json({ message: "Error obteniendo estadísticas del dashboard" });
  }
});

// GET /api/dashboard/top-classes
router.get("/top-classes", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id AS class_id,
        c.name AS class_name,
        c.level,
        COUNT(e.id) AS enrolled
      FROM enrollments e
      INNER JOIN schedules s ON s.id = e.schedule_id
      INNER JOIN classes c ON c.id = s.class_id
      GROUP BY c.id, c.name, c.level
      ORDER BY enrolled DESC, c.name ASC
      LIMIT 10
    `);

    res.json(rows);
  } catch (error) {
    console.error("dashboard top-classes error:", error);
    res.status(500).json({ message: "Error obteniendo clases más demandadas" });
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
      INNER JOIN classes c ON c.id = s.class_id
      INNER JOIN admins a ON a.id = s.instructor_id
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
      ORDER BY enrolled DESC, c.name ASC
      LIMIT 10
    `);

    res.json(rows);
  } catch (error) {
    console.error("dashboard top-schedules error:", error);
    res.status(500).json({ message: "Error obteniendo horarios más llenos" });
  }
});

module.exports = router;