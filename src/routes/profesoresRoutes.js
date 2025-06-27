import express from "express";
import Profesor from "../models/Profesor.js";

const router = express.Router();

// GET /api/profesores - Obtener todos los profesores
router.get("/", async (req, res) => {
  try {
    const profesores = await Profesor.find({ status: true });
    res.json(profesores);
  } catch (error) {
    console.error("Error obteniendo profesores:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
