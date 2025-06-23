import express from "express";
import Student from "../models/Student.js"; // Importa el modelo Student
import protectRoute from "../middleware/auth.middleware.js"; // proteger rutas

const router = express.Router();

// Obtener un estudiante por ID
router.get("/:id", protectRoute, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Estudiante no encontrado." });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error("Error al obtener estudiante por ID:", error);
        // Maneja el error si el ID no es válido (ej. CastError)
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "ID de estudiante inválido." });
        }
        res.status(500).json({ message: "Error interno del servidor al obtener el estudiante." });
    }
});

// Obtener un estudiante por Cédula
router.get("/cedula/:cedula", protectRoute, async (req, res) => {
    try {
        const student = await Student.findOne({ cedula: req.params.cedula });

        if (!student) {
            return res.status(404).json({ message: "Estudiante no encontrado con esa cédula." });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error("Error al obtener estudiante por cédula:", error);
        res.status(500).json({ message: "Error interno del servidor al obtener el estudiante por cédula." });
    }
});

export default router;