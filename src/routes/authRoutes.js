import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


const router = express.Router();

const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        console.error("ERROR: JWT_SECRET no está definido en las variables de entorno para generateToken.");
        throw new Error("JWT_SECRET no configurado en el servidor.");
    }
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
    console.log("Backend: Token generado para userId:", userId, "->", token);
    return token;
}

// Ruta de Registro
router.post("/register", async (req, res) => {
    try {
        const { cedula, email, password } = req.body;

        // ** VALIDACIONES DE ENTRADA **
        if (!cedula || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son requeridos." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
        }

        if (cedula.length < 8) {
            return res.status(400).json({ message: "La cédula debe tener al menos 8 caracteres." });
        }

        // ** VERIFICAR EXISTENCIA DE USUARIO **
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Este correo electrónico ya está registrado." });
        }

        const existingCedula = await User.findOne({ cedula });
        if (existingCedula) {
            return res.status(400).json({ message: "Esta cédula ya está registrada." });
        }

        // ** CREAR IMAGEN DE PERFIL (AVATAR) **
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cedula}`;

        // ** CREAR NUEVO USUARIO **
        const user = new User({
            cedula,
            email,
            password,
            profileImage, // Asignar la imagen de perfil
        });

        await user.save(); // Esto activará el pre-save hook para hashear la contraseña

        // ** GENERAR TOKEN Y RESPONDER **
        const token = generateToken(user._id); // Usamos user._id, que es el ID de Mongoose

        console.log("Backend: Registro exitoso. Respondiendo con token y usuario.");
        res.status(201).json({
            token: token,
            user: {
                _id: user._id,
                id: user.id, // Incluir el ID autoincremental si es relevante para el frontend
                cedula: user.cedula,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: new Date(),
            },
            message: "¡Registro completado exitosamente! Por favor, inicia sesión para continuar." // <-- ¡NUEVO MENSAJE DE ÉXITO!
        });

    } catch (error) {
        console.error("Error en la ruta de registro:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: "Error interno del servidor al registrar." });
    }
});

// Ruta de Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ** VALIDACIONES DE ENTRADA **
        //cambio de cedula a email
        if (!email || !password) {
            return res.status(400).json({ message: "Todos los campos son requeridos para iniciar sesión. (validacion de entrada)" });
        }

        // ** VERIFICAR SI EL USUARIO EXISTE **
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email o contraseña inválida." });
        }

        // ** VERIFICAR CONTRASEÑA (USANDO EL MÉTODO comparePassword DEL MODELO) **
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Email o contraseña inválida." });
        }

        // ** GENERAR TOKEN Y RESPONDER **
        const token = generateToken(user._id);

        // Actualizar last_login
        user.last_login = new Date();
        await user.save({ validateBeforeSave: false }); // No validar de nuevo al actualizar last_login

        console.log("Backend: Inicio de sesión exitoso. Respondiendo con token y usuario.");
        res.status(200).json({
            token: token,
            user: {
                _id: user._id,
                id: user.id, // Incluir el ID autoincremental si es relevante para el frontend
                cedula: user.cedula,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            },
            message: "¡Inicio de sesión exitoso!" // Opcional: mensaje de éxito también para el login
        });

    } catch (error) {
        console.error("Error en la ruta de inicio de sesión:", error);
        res.status(500).json({ message: "Error interno del servidor al iniciar sesión." });
    }
});

export default router;