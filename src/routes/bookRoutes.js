import express from "express";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";
import Book from "../models/Book.js"; // <-- ¡CORRECCIÓN CRÍTICA: Importar Book!

const router = express.Router();

// Crear un libro
router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Todos los campos son requeridos." });
        }

        // Subir la imagen a Cloudinary
        // Asegúrate de que 'image' sea una cadena base64 o una URL válida para cargar
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        // Guardar en la base de datos
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id, // req.user viene del middleware protectRoute
        });

        await newBook.save();

        res.status(201).json(newBook);
    } catch (error) {
        console.error("Error al crear el libro:", error); // Loggea el error completo
        // Mensaje genérico para el cliente en caso de error interno del servidor
        res.status(500).json({ message: "Error interno del servidor al crear el libro." });
    }
});

// Paginación y obtener todos los libros
router.get("/", protectRoute, async (req, res) => {
    console.log("Usuario autenticado:", req.user);
    
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "email profileImage"); // Poblamos solo los campos necesarios del usuario

        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });

    } catch (error) {
        console.error("Error al obtener todos los libros:", error);
        res.status(500).json({ message: "Error interno del servidor al obtener libros." });
    }
});

//get recommended books by the logged user <---- FALTABA
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("Get user books error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});



// Eliminar un libro
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Libro no encontrado." });
        }

        // Verificar si el usuario autenticado es el propietario del libro
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "No autorizado para eliminar este libro." });
        }

        // Eliminar la imagen de Cloudinary
        // Asegúrate de que `book.image` contiene una URL de Cloudinary para intentar eliminarla
        if (book.image && book.image.includes("cloudinary")) {
            try {
                // Extraer el public ID de la URL de Cloudinary
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
                console.log("Imagen eliminada de Cloudinary:", publicId);
            } catch (deleteError) {
                console.error("Error al eliminar la imagen de Cloudinary:", deleteError);
                // No retornar un error 500 aquí, el libro aún se puede eliminar de la DB
            }
        }

        await book.deleteOne(); // Usa deleteOne() en Mongoose 6+

        res.json({ message: "Libro eliminado exitosamente." });

    } catch (error) {
        console.error("Error al eliminar el libro:", error);
        res.status(500).json({ message: "Error interno del servidor al eliminar el libro." });
    }
});

export default router;