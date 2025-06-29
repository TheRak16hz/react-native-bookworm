import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Almacenará el URL seguro de Cloudinary (una sola imagen)
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  }
}, {
  timestamps: true
});

const Post = mongoose.model("Post", postSchema);

export default Post;