const artesanoModel = require('../models/artesano.model');

const getArtesanos = async (req, res) => {
  try {
    const artesanos = await artesanoModel.getArtesanos();
    res.json(artesanos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener artesanos' });
  }
};

const getArtesanoById = async (req, res) => {
  try {
    const { id } = req.params;
    const artesano = await artesanoModel.getArtesanoById(id);
    if (!artesano) return res.status(404).json({ error: 'Artesano no encontrado' });
    res.json(artesano);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener artesano' });
  }
};

module.exports = { getArtesanos, getArtesanoById };