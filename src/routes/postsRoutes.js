import express from "express";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";
import Post from "../models/Post.js";
import Staff from "../models/Staff.js";

const router = express.Router();

// Crear post
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, description, image } = req.body;

    if (!title || !description || !image) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newPost = new Post({
      title,
      description,
      image: imageUrl,
      user: req.user._id, // viene del middleware de autenticación
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error al crear el post:", error);
    res.status(500).json({ message: "Error interno del servidor al crear el post." });
  }
});

// Obtener un post por ID
router.get('/:id', protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error al obtener post por ID:', error);
    res.status(500).json({ message: 'Error al obtener el post.' });
  }
});

// Obtener todos los posts paginados
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user"); // ← usamos "staff" automáticamente por el modelo

    const totalPosts = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error) {
    console.error("Error al obtener todos los posts:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener posts." });
  }
});

// UPDATE post
router.put("/:id", protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post no encontrado." });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "No autorizado para actualizar este post." });
    }

    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Título y descripción requeridos." });
    }

    post.title = title;
    post.description = description;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Error al actualizar el post:", error);
    res.status(500).json({ message: "Error interno al actualizar el post." });
  }
});


// Eliminar post
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post no encontrado." });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "No autorizado para eliminar este post." });
    }

    if (post.image && post.image.includes("cloudinary")) {
      try {
        const publicId = post.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error("Error al eliminar imagen Cloudinary:", deleteError);
      }
    }

    await post.deleteOne();
    res.json({ message: "Post eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el post:", error);
    res.status(500).json({ message: "Error interno del servidor al eliminar el post." });
  }
});

export default router;
