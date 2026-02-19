const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth"); // el tuyo (JWT)
const allowRoles = require("../middleware/authorize"); // si ya lo usas

// GET /api/reports/enrollments-by-class
router.get("/enrollments-by-class", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id   AS class_id,
        c.name AS class_name,
        c.level AS class_level,
        COUNT(e.id) AS total_enrolled
      FROM classes c
      JOIN schedules s ON s.class_id = c.id
      LEFT JOIN enrollments e ON e.schedule_id = s.id
      GROUP BY c.id, c.name, c.level
      ORDER BY total_enrolled DESC, c.name ASC
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en reporte enrollments-by-class" });
  }
});

// GET /api/reports/enrollments-by-student
// ADMIN: ve todo
// INSTRUCTOR: ve solo sus horarios
router.get(
  "/enrollments-by-student",
  auth,
  allowRoles("ADMIN", "INSTRUCTOR"),
  async (req, res) => {
    try {
      const role = req.user.role;
      const instructorId = req.user.id; // OJO: debe ser el id del admin/instructor logueado

      const params = [];
      let where = "";

      if (role === "INSTRUCTOR") {
        where = "WHERE s.instructor_id = ?";
        params.push(instructorId);
      }

      // Reporte agrupado por alumno
      const [rows] = await db.query(
  `
  SELECT
    st.id AS student_id,
    CONCAT(st.first_name, ' ', st.last_name) AS student_name,
    st.dni AS dni,
    COUNT(e.id) AS total_enrollments
  FROM enrollments e
  JOIN students st ON st.id = e.student_id
  JOIN schedules s ON s.id = e.schedule_id
  ${where}
  GROUP BY st.id, st.first_name, st.last_name, st.dni
  ORDER BY total_enrollments DESC, student_name ASC
  `,
  params
);


      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error en enrollments-by-student" });
    }
  }
);


module.exports = router;