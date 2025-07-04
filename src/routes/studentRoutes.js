import express from "express";
import Student from "../models/Student.js";
import protectRoute from "../middleware/auth.middleware.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import formidable from "formidable";
import cloudinary from "../lib/cloudinary.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta para subir ZIP
router.post('/upload-project', protectRoute, async (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files?.file) {
      console.error("Error al recibir archivo:", err);
      return res.status(400).json({ message: "Archivo inválido." });
    }

    const filePath = files.file[0].filepath;

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw", // para ZIP u otros binarios
        folder: "proyectos"
      });

      // Puedes guardar `result.secure_url` en tu base de datos aquí

      res.status(200).json({
        message: "Proyecto subido con éxito",
        url: result.secure_url
      });

      // (Opcional) eliminar el archivo temporal
      fs.unlink(filePath, () => {});

    } catch (error) {
      console.error("Error subiendo a Cloudinary:", error);
      res.status(500).json({ message: "Error subiendo archivo." });
    }
  });
});


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
