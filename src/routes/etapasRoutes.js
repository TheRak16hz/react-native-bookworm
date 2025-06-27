import express from 'express';
import Etapa from '../models/Etapa.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Obtener todas las etapas
router.get('/', protectRoute, async (req, res) => {
  try {
    const etapas = await Etapa.find();
    res.json(etapas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener las etapas' });
  }
});

// Crear una etapa
router.post('/', protectRoute, async (req, res) => {
  try {
    const { etapa, fecha_inicio, fecha_fin, jurado } = req.body;

    const exists = await Etapa.findOne({ etapa });
    if (exists) {
      return res.status(400).json({ message: 'La etapa ya existe' });
    }

    const nuevaEtapa = new Etapa({
      etapa,
      fecha_inicio,
      fecha_fin,
      jurado,
      createdAt: new Date()
    });

    await nuevaEtapa.save();
    res.status(201).json(nuevaEtapa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear la etapa' });
  }
});

// Eliminar una etapa por nombre
router.delete('/:etapa', protectRoute, async (req, res) => {
  try {
    const deleted = await Etapa.findOneAndDelete({ etapa: req.params.etapa });
    if (!deleted) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }
    res.json({ message: 'Etapa eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la etapa' });
  }
});

export default router;
