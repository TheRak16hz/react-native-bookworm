import express from "express";
import Student from "../models/Student.js";
import protectRoute from "../middleware/auth.middleware.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Project from "../models/Projects.js";

const router = express.Router();

// Configuración de Multer en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// RUTA: Obtener estudiante por ID
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Estudiante no encontrado." });

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
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    });
  } catch (error) {
    console.error("Error al obtener estudiante por ID:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "ID de estudiante inválido." });
    }
    res.status(500).json({ message: "Error interno del servidor al obtener el estudiante." });
  }
});

// RUTA: Obtener estudiante por cédula
router.get("/cedula/:cedula", protectRoute, async (req, res) => {
  try {
    const student = await Student.findOne({ cedula: req.params.cedula });
    if (!student) return res.status(404).json({ message: "Estudiante no encontrado con esa cédula." });

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
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    });
  } catch (error) {
    console.error("Error al obtener estudiante por cédula:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener el estudiante por cédula." });
  }
});

// NUEVA RUTA: Subir archivo ZIP a Cloudinary
router.post("/upload-project", protectRoute, upload.single("archivo"), async (req, res) => {
  try {
    const { nombre, id_estudiantes, añoCreado, trayecto } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Archivo no recibido" });
    }

    if (req.file.mimetype !== "application/zip") {
      return res.status(400).json({ message: "Solo se permiten archivos .zip" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "proyectos_zip" },
      async (error, result) => {
        if (error) {
          console.error("Error al subir a Cloudinary:", error);
          return res.status(500).json({ message: "Error al subir archivo", error });
        }

        const nuevoProyecto = new Project({
          nombre,
          id_estudiantes: JSON.parse(id_estudiantes),
          añoCreado,
          trayecto,
          archivoUrl: result.secure_url
        });

        await nuevoProyecto.save();
        res.status(200).json({ message: "Proyecto subido exitosamente", proyecto: nuevoProyecto });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    console.error("Error en subida de proyecto:", error);
    res.status(500).json({ message: "Error interno en la subida de proyecto" });
  }
});

export default router;
