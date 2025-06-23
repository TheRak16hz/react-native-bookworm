import express from "express";
import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";
import protectRoute from "../middleware/auth.middleware.js";  // Asegúrate de tener el middleware

const router = express.Router();

const generateToken = (staffId, role) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET no está definido.");
    throw new Error("JWT_SECRET no configurado.");
  }
  return jwt.sign({ staffId, role }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son requeridos." });
    }

    const staff = await Staff.findOne({ correo });
    if (!staff) {
      return res.status(400).json({ message: "Correo o contraseña inválida." });
    }

    const isPasswordCorrect = await staff.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Correo o contraseña inválida." });
    }

    const token = generateToken(staff._id, staff.role);

    res.status(200).json({
      token,
      staff: {
        _id: staff._id,
        id: staff.id,
        cedula: staff.cedula,
        correo: staff.correo,
        nombre: staff.nombre,
        apellido: staff.apellido,
        role: staff.role,
        createdAt: staff.createdAt,
      },
      message: "Inicio de sesión exitoso."
    });

  } catch (error) {
    console.error("Error en login del staff:", error);
    res.status(500).json({ message: "Error interno del servidor al iniciar sesión." });
  }
});

// GET /staff/cedula/:cedula - Obtener info básica del staff
router.get("/cedula/:cedula", protectRoute, async (req, res) => {
  try {
    const { cedula } = req.params;

    const staff = await Staff.findOne({ cedula }).select("-password");
    if (!staff) {
      return res.status(404).json({ message: "Staff no encontrado" });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.error("Error al obtener staff:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
