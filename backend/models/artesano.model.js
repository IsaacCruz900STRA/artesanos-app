const db = require('../config/db');

const getArtesanos = async () => {
  const result = await db.query(`
    SELECT a.id_artesano, a.estado, a.descripcion, a.fecha_registro,
           u.nombre, u.email,
           COUNT(p.id_producto) AS total_productos
    FROM artesanos a
    JOIN usuarios u ON a.id_usuario = u.id_usuario
    LEFT JOIN productos p ON p.id_artesano = a.id_artesano
    GROUP BY a.id_artesano, u.nombre, u.email
    ORDER BY a.fecha_registro DESC
  `);
  return result.rows;
};

const getArtesanoById = async (id) => {
  const result = await db.query(`
    SELECT a.id_artesano, a.estado, a.descripcion, a.fecha_registro,
           u.nombre, u.email,
           COUNT(p.id_producto) AS total_productos
    FROM artesanos a
    JOIN usuarios u ON a.id_usuario = u.id_usuario
    LEFT JOIN productos p ON p.id_artesano = a.id_artesano
    WHERE a.id_artesano = $1
    GROUP BY a.id_artesano, u.nombre, u.email
  `, [id]);
  return result.rows[0];
};

module.exports = { getArtesanos, getArtesanoById };