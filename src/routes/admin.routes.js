const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();

const isAdmin = (req) => req.user?.role === "ADMIN";

// POST /api/auth/instructors
router.post("/instructors", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Solo ADMIN" });

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email y password son obligatorios" });
    }

    //validar que no exista
    const [exists] = await pool.query("SELECT id FROM admins WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.status(409).json({ message: "Ese email ya existe" });
    }

    //hasheando password
    const hash = await bcrypt.hash(password, 10);

    //insertar como INSTRUCTOR
    const [result] = await pool.query(
      "INSERT INTO admins (email, password, role) VALUES (?, ?, 'INSTRUCTOR')",
      [email, hash]
    );

    res.status(201).json({ ok: true, id: result.insertId, email, role: "INSTRUCTOR" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
