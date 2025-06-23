import mongoose from 'mongoose';

const etapas_info = new mongoose.Schema({
  etapa: { type: String, required: true, unique: true },
  fecha_inicio: { type: Date, required: true },
  fecha_fin: { type: Date, required: true },
  jurado: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }],
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'etapas_info',
});

export default mongoose.model('Etapa', etapas_info);
