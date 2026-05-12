const db = require('../config/db');

const getProductos = async () => {
  const result = await db.query(`
    SELECT p.*, c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    ORDER BY p.fecha_creacion DESC
  `);
  return result.rows;
};

const getProductoById = async (id) => {
  const result = await db.query(`
    SELECT p.*, c.nombre AS categoria,
           u.nombre AS artesano_nombre,
           a.estado AS artesano_region,
           a.foto_url AS artesano_foto
    FROM productos p
    LEFT JOIN categorias c  ON p.id_categoria  = c.id_categoria
    LEFT JOIN artesanos  a  ON p.id_artesano   = a.id_artesano
    LEFT JOIN usuarios   u  ON a.id_usuario    = u.id_usuario
    WHERE p.id_producto = $1
  `, [id]);
  return result.rows[0];
};

const crearProducto = async (nombre, descripcion, precio, id_categoria, id_artesano, imagen_url) => {
  const result = await db.query(
    `INSERT INTO productos (nombre, descripcion, precio, id_categoria, id_artesano, imagen_url)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [nombre, descripcion, precio, id_categoria || null, id_artesano || null, imagen_url || null]
  );
  return result.rows[0];
};

const actualizarProducto = async (id, nombre, descripcion, precio, id_categoria, imagen_url) => {
  const result = await db.query(
    `UPDATE productos
     SET nombre=$1, descripcion=$2, precio=$3, id_categoria=$4, imagen_url=$5
     WHERE id_producto=$6 RETURNING *`,
    [nombre, descripcion, precio, id_categoria || null, imagen_url || null, id]
  );
  return result.rows[0];
};

const eliminarProducto = async (id) => {
  return db.query('DELETE FROM productos WHERE id_producto = $1', [id]);
};

module.exports = { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto };