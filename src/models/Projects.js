// models/Projects.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  id_estudiantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Estudiante' }],
  añoCreado: { type: Number, required: true },
  trayecto: { type: String, required: true },
  archivoUrl: { type: String, required: true },
  fechaSubida: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
