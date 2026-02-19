require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth.routes");
const auth = require("./middleware/auth");
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

// prueba rápida
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API running" });
});

//prueba de conexión a BD
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ ok: true, db: "connected", result: rows[0].result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error conectando a MySQL" });
  }
});


app.get("/me", auth, (req, res) => {
  res.json({
    ok: true,
    user: req.user,
  });
});


const port = process.env.PORT || 3000;
app.use("/api/auth", authRoutes);


app.use("/api/students", studentsRoutes);

app.use("/api/classes", classesRoutes);


app.use("/api/schedules", schedulesRoutes);

app.use("/api/instructors", instructorsRoutes);

app.use("/api/enrollments", enrollmentsRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/reports", reportsRoutes);

app.use("/api/reports", require("./routes/reports.routes"));  

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});



