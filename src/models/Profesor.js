import mongoose from "mongoose";

const profesores = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  cedula: {
    type: Number,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    required: true
  }
}, {
  collection: 'profesores',
  timestamps: true
});

export default mongoose.model("Profesor", profesores);
