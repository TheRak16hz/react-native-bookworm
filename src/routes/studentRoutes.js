import express from "express";
import Student from "../models/Student.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// Obtener un estudiante por ID
router.get("/:id", protectRoute, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Estudiante no encontrado." });
        }

        res.status(200).json({
            _id: student._id,
            id: student.id,
            nombre: student.nombre,
            apellido: student.apellido,
            cedula: student.cedula,
            email: student.email,
            seccion: student.seccion,
            fecha_nacimiento: student.fecha_nacimiento,
            numero_telefono: student.numero_telefono,
            direccion: student.direccion,
            sexo: student.sexo,
            status: student.status,
            ultimo_año_cursado: student.ultimo_año_cursado,
            createdAt: student.createdAt, // ✅ incluido
            updatedAt: student.updatedAt  // opcional
        });

    } catch (error) {
        console.error("Error al obtener estudiante por ID:", error);
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

        res.status(200).json({
            _id: student._id,
            id: student.id,
            nombre: student.nombre,
            apellido: student.apellido,
            cedula: student.cedula,
            email: student.email,
            seccion: student.seccion,
            fecha_nacimiento: student.fecha_nacimiento,
            numero_telefono: student.numero_telefono,
            direccion: student.direccion,
            sexo: student.sexo,
            status: student.status,
            ultimo_año_cursado: student.ultimo_año_cursado,
            createdAt: student.createdAt, // ✅ incluido
            updatedAt: student.updatedAt  // opcional
        });

    } catch (error) {
        console.error("Error al obtener estudiante por cédula:", error);
        res.status(500).json({ message: "Error interno del servidor al obtener el estudiante por cédula." });
    }
});

export default router;
