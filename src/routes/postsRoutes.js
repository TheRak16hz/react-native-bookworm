import express from "express";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";
import Post from "../models/Post.js";

const router = express.Router();

// Crear post
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, description, image } = req.body;

    if (!title || !description || !image) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    // Subir a Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newPost = new Post({
      title,
      description,
      image: imageUrl,
      user: req.user._id,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error al crear el post:", error);
    res.status(500).json({ message: "Error interno del servidor al crear el post." });
  }
});

// Obtener posts del usuario
router.get("/user", protectRoute, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener posts." });
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
        console.log("Imagen eliminada de Cloudinary:", publicId);
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
