const db = require('../config/db');

const getProductos = async () => {
  const result = await db.query('SELECT * FROM productos');
  return result.rows;   // 👈 CLAVE
};

const crearProducto = async (nombre, descripcion, precio) => {
  const result = await db.query(
    'INSERT INTO productos (nombre, descripcion, precio) VALUES ($1, $2, $3) RETURNING *',
    [nombre, descripcion, precio]
  );
  return result.rows[0];
};

const eliminarProducto = async (id) => {
  return db.query(
    'DELETE FROM productos WHERE id_producto=$1',
    [id]
  );
};

module.exports = {
  getProductos,
  crearProducto,
  eliminarProducto
};