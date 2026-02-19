const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  listAvailableSchedules,
  createEnrollment,
  listEnrollments,
  deleteEnrollment,
  updateEnrollment,
} = require("../controllers/enrollments.controller");

const router = express.Router();

// Horarios con cupos (para inscribir/cambiar)
router.get("/available", auth, authorize("ADMIN", "INSTRUCTOR"), listAvailableSchedules);

// Crear inscripción
router.post("/", auth, authorize("ADMIN", "INSTRUCTOR"), createEnrollment);

// Listar inscripciones
router.get("/", auth, authorize("ADMIN", "INSTRUCTOR"), listEnrollments);

// Cancelar
router.delete("/:id", auth, authorize("ADMIN", "INSTRUCTOR"), deleteEnrollment);

// Modificar (cambiar horario)
router.put("/:id", auth, authorize("ADMIN", "INSTRUCTOR"), updateEnrollment);

module.exports = router;
