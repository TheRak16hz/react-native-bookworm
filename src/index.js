import express from "express";
import cors from "cors";
import "dotenv/config"; // Asegúrate de que dotenv se cargue al inicio

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import studentRoutes from './routes/studentRoutes.js'; //importamos student
import staffRoutes from './routes/staffRoutes.js'; // importamos staff
import etapasRoutes from './routes/etapasRoutes.js';      // <-- Importa etapas
import profesoresRoutes from './routes/profesoresRoutes.js'; // <-- Importa profesores
import postsRoutes from './routes/postsRoutes.js' // importamos posts

import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globales
job.start();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use(cors());         // Para manejar las políticas de CORS

// Ruta raíz para verificar el servidor
app.get('/', (req, res) => {
    res.send('Servidor Bookworm API está funcionando!');
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/students", studentRoutes); // ruta para estudiantes
app.use("/api/staff", staffRoutes); // ruta para staff
app.use("/api/etapas", etapasRoutes);          // <-- Añade la ruta de etapas
app.use("/api/profesores", profesoresRoutes);  // <-- Añade la ruta de profesores
app.use("/api/posts", postsRoutes); // ruta para posts

// Conectar a la DB antes de iniciar el servidor
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to database or start server:", error);
        process.exit(1);
    }
};

startServer();
