const express = require("express");
const router = express.Router();

const db = require("../db");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// GET /api/reports/enrollments-by-class
// ADMIN: ve todo
// INSTRUCTOR: ve solo sus horarios
router.get(
  "/enrollments-by-class",
  auth,
  authorize("ADMIN", "INSTRUCTOR"),
  async (req, res) => {
    try {
      const params = [];
      let where = "";

      if (req.user.role === "INSTRUCTOR") {
        where = "WHERE s.instructor_id = ?";
        params.push(req.user.id);
      }

      const [rows] = await db.query(
        `
        SELECT
          c.id AS class_id,
          c.name AS class_name,
          c.level AS class_level,
          COUNT(e.id) AS total_enrolled
        FROM classes c
        INNER JOIN schedules s ON s.class_id = c.id
        LEFT JOIN enrollments e ON e.schedule_id = s.id
        ${where}
        GROUP BY c.id, c.name, c.level
        ORDER BY total_enrolled DESC, c.name ASC
        `,
        params
      );

      res.json(rows);
    } catch (error) {
      console.error("reports enrollments-by-class error:", error);
      res.status(500).json({ message: "Error en reporte de inscripciones por clase" });
    }
  }
);

// GET /api/reports/enrollments-by-student
// ADMIN: ve todo
// INSTRUCTOR: ve solo sus horarios
router.get(
  "/enrollments-by-student",
  auth,
  authorize("ADMIN", "INSTRUCTOR"),
  async (req, res) => {
    try {
      const params = [];
      let where = "";

      if (req.user.role === "INSTRUCTOR") {
        where = "WHERE s.instructor_id = ?";
        params.push(req.user.id);
      }

      const [rows] = await db.query(
        `
        SELECT
          st.id AS student_id,
          CONCAT(st.first_name, ' ', st.last_name) AS student_name,
          st.dni AS dni,
          COUNT(e.id) AS total_enrollments
        FROM enrollments e
        INNER JOIN students st ON st.id = e.student_id
        INNER JOIN schedules s ON s.id = e.schedule_id
        ${where}
        GROUP BY st.id, st.first_name, st.last_name, st.dni
        ORDER BY total_enrollments DESC, student_name ASC
        `,
        params
      );

      res.json(rows);
    } catch (error) {
      console.error("reports enrollments-by-student error:", error);
      res.status(500).json({ message: "Error en reporte de inscripciones por alumno" });
    }
  }
);

module.exports = router;