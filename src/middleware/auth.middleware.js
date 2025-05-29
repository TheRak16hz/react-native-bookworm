import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    let token; // Declara el token aquí para un alcance más amplio

    try {
        // 1. Obtener el token de los headers de autorización
        // Se espera un formato "Bearer <TOKEN>"
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Si no hay token o no está en el formato esperado
        if (!token) {
            console.warn("Middleware: No se recibió token de autenticación o formato incorrecto.");
            return res.status(401).json({ message: "No authentication token, access denied" });
        }

        // 2. Verificar que JWT_SECRET esté definido antes de usarlo
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length === 0) {
            console.error("Middleware ERROR: JWT_SECRET no está definido o está vacío. Por favor, configura esta variable de entorno.");
            // Evita que el servidor colapse si la configuración es incorrecta
            return res.status(500).json({ message: "Error de configuración del servidor: JWT secret no establecido." });
        }

        // 3. Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Middleware: Token decodificado exitosamente:", decoded); // Log para depuración

        // 4. Encontrar el usuario en la base de datos
        // Excluir la contraseña por seguridad al adjuntar el usuario a la solicitud
        const user = await User.findById(decoded.userId).select("-password");

        // 5. Verificar si el usuario existe para el ID decodificado
        if (!user) {
            console.warn("Middleware: Usuario no encontrado para el ID decodificado en el token:", decoded.userId);
            return res.status(401).json({ message: "Token is not valid (user not found)" });
        }

        // 6. Adjuntar el usuario a la solicitud para uso en las rutas subsiguientes
        req.user = user;
        next(); // Continuar con la siguiente función del middleware o la ruta
    } catch (error) {
        // Captura y maneja errores específicos de JWT
        console.error("Authentication error in middleware:", error); // Loggea el objeto error completo

        let errorMessage = "Token is not valid.";
        if (error.name === 'TokenExpiredError') {
            errorMessage = "Token has expired. Please log in again.";
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = `Invalid token: ${error.message}.`;
        }
        // Puedes agregar más casos si necesitas manejar otros errores específicos (ej. NotBeforeError)

        return res.status(401).json({ message: errorMessage });
    }
};

export default protectRoute;