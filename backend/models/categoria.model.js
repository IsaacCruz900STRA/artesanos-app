const db = require('../config/db');

const getCategorias = async () => {
  const result = await db.query('SELECT * FROM categorias ORDER BY nombre');
  return result.rows;
};

const getCategoriaById = async (id) => {
  const result = await db.query('SELECT * FROM categorias WHERE id_categoria = $1', [id]);
  return result.rows[0];
};

module.exports = { getCategorias, getCategoriaById };