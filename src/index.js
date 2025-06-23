import express from "express";
import cors from "cors";
import "dotenv/config"; // Asegúrate de que dotenv se cargue al inicio

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
//importar las rutas para luego usarlas
import studentRoutes from './routes/studentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';





import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware globales
job.start();
app.use(express.json()); // Para parsear el body de las solicitudes JSON
app.use(cors());         // Para manejar las políticas de CORS

// Definir una ruta raíz simple para verificar que el servidor está activo
app.get('/', (req, res) => {
    res.send('Servidor Bookworm API está funcionando!');
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

//CRITICO, añadir las rutas nuevas
app.use("/api/students", studentRoutes);
app.use("/api/staff", staffRoutes);

// ** CORRECCIÓN CRÍTICA: Conectar a la DB antes de iniciar el servidor **
const startServer = async () => {
    try {
        await connectDB(); // Espera a que la base de datos se conecte
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to database or start server:", error);
        process.exit(1); // Salir si hay un error crítico
    }
};

startServer(); // Llama a la función para iniciar todo