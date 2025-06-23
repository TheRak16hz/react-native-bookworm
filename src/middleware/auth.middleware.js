import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Staff from '../models/Staff.js'; // Importamos Staff

const protectRoute = async (req, res, next) => {
    let token;

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            console.warn("No token provided");
            return res.status(401).json({ message: "No authentication token, access denied" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET missing");
            return res.status(500).json({ message: "Server misconfiguration: JWT secret not set" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded:", decoded);

        let user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            // Si no es un User normal, busca en Staff
            user = await Staff.findById(decoded.staffId).select("-password");
        }

        if (!user) {
            console.warn("User not found");
            return res.status(401).json({ message: "Token is not valid (user not found)" });
        }

        req.user = user;
        req.role = decoded.role || null; // Incluimos el role del token
        next();
    } catch (error) {
        console.error("Auth error:", error);
        let msg = "Token is not valid.";
        if (error.name === 'TokenExpiredError') {
            msg = "Token has expired. Please log in again.";
        } else if (error.name === 'JsonWebTokenError') {
            msg = `Invalid token: ${error.message}.`;
        }
        return res.status(401).json({ message: msg });
    }
};

// Nuevo: Middleware para validar roles
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.role || !allowedRoles.includes(req.role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action." });
        }
        next();
    };
};

export default protectRoute;
