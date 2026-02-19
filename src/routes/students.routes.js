const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");


const router = express.Router();

// LISTAR alumnos
router.get("/", auth, authorize("ADMIN", "INSTRUCTOR"), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error listando estudiantes" });
  }
});

// CREAR alumno
router.post("/", auth, authorize("ADMIN"), async (req, res) => {
  try {
    const { first_name, last_name, dni, phone } = req.body;

    if (!first_name || !last_name || !dni) {
      return res
        .status(400)
        .json({ message: "first_name, last_name y dni son requeridos" });
    }

    await pool.query(
      "INSERT INTO students (first_name, last_name, dni, phone) VALUES (?, ?, ?, ?)",
      [first_name, last_name, dni, phone || null]
    );

    res.status(201).json({ message: "Estudiante creado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando estudiante" });
  }
});

// ACTUALIZAR alumno 
router.put("/:id", auth, authorize("ADMIN", "INSTRUCTOR"), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, dni, phone } = req.body;

    const [result] = await pool.query(
      "UPDATE students SET first_name=?, last_name=?, dni=?, phone=? WHERE id=?",
      [first_name, last_name, dni, phone || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.json({ message: "Estudiante actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando estudiante" });
  }
});

// ELIMINAR alumno 
router.delete("/:id", auth, authorize("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM students WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.json({ message: "Estudiante eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando estudiante" });
  }
});

module.exports = router;
