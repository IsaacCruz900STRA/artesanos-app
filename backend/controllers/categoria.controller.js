const categoriaModel = require('../models/categoria.model');

const getCategorias = async (req, res) => {
  try {
    const categorias = await categoriaModel.getCategorias();
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await categoriaModel.getCategoriaById(id);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

module.exports = { getCategorias, getCategoriaById };