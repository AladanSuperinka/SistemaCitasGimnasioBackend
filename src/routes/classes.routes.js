const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");


const canEdit = (role) => role === "ADMIN" || role === "INSTRUCTOR";
const isAdmin = (role) => role === "ADMIN";


router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, level, capacity, created_at FROM classes ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo clases" });
  }
});


router.post("/", auth, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ message: "Solo administradores" });
    }

    const { name, description, level, capacity } = req.body;

    if (!name || !level || capacity == null) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const capNum = Number(capacity);
    if (Number.isNaN(capNum) || capNum <= 0) {
      return res.status(400).json({ message: "capacity debe ser un número > 0" });
    }

    const [result] = await pool.query(
      "INSERT INTO classes (name, description, level, capacity) VALUES (?, ?, ?, ?)",
      [name, description || null, level, capNum]
    );

    res.status(201).json({
      message: "Clase creada",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando clase" });
  }
});


router.put("/:id", auth, async (req, res) => {
  try {
    if (!canEdit(req.user.role)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { id } = req.params;
    const { name, description, level, capacity } = req.body;

    if (!name || !level || capacity == null) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const capNum = Number(capacity);
    if (Number.isNaN(capNum) || capNum <= 0) {
      return res.status(400).json({ message: "capacity debe ser un número > 0" });
    }

    const [result] = await pool.query(
      "UPDATE classes SET name=?, description=?, level=?, capacity=? WHERE id=?",
      [name, description || null, level, capNum, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    res.json({ message: "Clase actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando clase" });
  }
});


router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ message: "Solo administradores" });
    }

    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM classes WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }

    res.json({ message: "Clase eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando clase" });
  }
});

module.exports = router;
