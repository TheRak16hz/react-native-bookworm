import express from 'express';
import Etapa from '../models/Etapa.js'; // tu modelo etapas_info
import protectRoute from '../middlewares/authMiddleware.js';

const router = express.Router();

// Obtener etapa por nombre
router.get('/:etapa', protectRoute, async (req, res) => {
  try {
    const etapa = await Etapa.findOne({ etapa: req.params.etapa });
    if (!etapa) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }
    res.json(etapa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener la etapa' });
  }
});

// Crear etapa
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

// Actualizar etapa
router.put('/:etapa', protectRoute, async (req, res) => {
  try {
    const updated = await Etapa.findOneAndUpdate(
      { etapa: req.params.etapa },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Etapa no encontrada' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar la etapa' });
  }
});

// Eliminar etapa
router.delete('/:etapa', protectRoute, async (req, res) => {
  try {
    const deleted = await Etapa.findOneAndDelete({ etapa: req.params.etapa });
    if (!deleted) return res.status(404).json({ message: 'Etapa no encontrada' });
    res.json({ message: 'Etapa eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la etapa' });
  }
});

export default router;
