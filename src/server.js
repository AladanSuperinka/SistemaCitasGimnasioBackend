require("dotenv").config();
const express = require("express");
const cors = require("cors");

const pool = require("./db");
const auth = require("./middleware/auth");

const authRoutes = require("./routes/auth.routes");
const studentsRoutes = require("./routes/students.routes");
const classesRoutes = require("./routes/classes.routes");
const schedulesRoutes = require("./routes/schedules.routes");
const instructorsRoutes = require("./routes/instructors.routes");
const enrollmentsRoutes = require("./routes/enrollments.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportsRoutes = require("./routes/reports.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta rápida para verificar que la API está activa
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API running" });
});

// Prueba de conexión a MySQL
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ ok: true, db: "connected", result: rows[0].result });
  } catch (error) {
    console.error("test-db error:", error);
    res.status(500).json({ ok: false, message: "Error conectando a MySQL" });
  }
});

// Perfil del usuario logueado
app.get("/me", auth, (req, res) => {
  res.json({
    ok: true,
    user: req.user,
  });
});

// Opcional: misma respuesta pero bajo /api/me
app.get("/api/me", auth, (req, res) => {
  res.json({
    ok: true,
    user: req.user,
  });
});

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/instructors", instructorsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});