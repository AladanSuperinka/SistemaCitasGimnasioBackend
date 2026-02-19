const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();

const isAdmin = (req) => req.user?.role === "ADMIN";

// GET /api/instructors  (opcional: listar instructores)
router.get("/", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Solo ADMIN" });

    const [rows] = await pool.query(
      "SELECT id, email, role, created_at FROM admins WHERE role = 'INSTRUCTOR' ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// POST /api/instructors  (crear instructor)
router.post("/", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Solo ADMIN" });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email y password son obligatorios" });
    }

    // validar que no exista email
    const [exists] = await pool.query("SELECT id FROM admins WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.status(409).json({ message: "Ese email ya existe" });
    }

    // hashear password
    const hash = await bcrypt.hash(password, 10);

    // insertar como INSTRUCTOR
    const [result] = await pool.query(
      "INSERT INTO admins (email, password, role) VALUES (?, ?, 'INSTRUCTOR')",
      [email, hash]
    );

    res.status(201).json({
      ok: true,
      id: result.insertId,
      email,
      role: "INSTRUCTOR",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// PUT /api/instructors/:id
router.put("/:id", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Solo ADMIN" });

    const { id } = req.params;
    const { email, password } = req.body;

    // validar existe instructor
    const [rows] = await pool.query(
      "SELECT id FROM admins WHERE id = ? AND role = 'INSTRUCTOR'",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Instructor no encontrado" });

    // si cambian email, validar que no se repita
    if (email) {
      const [exists] = await pool.query(
        "SELECT id FROM admins WHERE email = ? AND id <> ?",
        [email, id]
      );
      if (exists.length > 0) return res.status(409).json({ message: "Ese email ya existe" });
    }

    // armar update dinámico
    let sql = "UPDATE admins SET ";
    const params = [];

    const sets = [];
    if (email) {
      sets.push("email = ?");
      params.push(email);
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      sets.push("password = ?");
      params.push(hash);
    }

    if (sets.length === 0) {
      return res.status(400).json({ message: "Nada para actualizar" });
    }

    sql += sets.join(", ") + " WHERE id = ? AND role = 'INSTRUCTOR'";
    params.push(id);

    await pool.query(sql, params);

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// DELETE /api/instructors/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Solo ADMIN" });

    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM admins WHERE id = ? AND role = 'INSTRUCTOR'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Instructor no encontrado" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});



module.exports = router;
