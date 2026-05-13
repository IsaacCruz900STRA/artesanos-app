const db = require('../config/db');

const getArtesanos = async () => {
  const result = await db.query(`
    SELECT a.id_artesano, a.estado AS region, a.descripcion, a.fecha_registro,
           u.id_usuario, u.nombre, u.email, u.estado,
           COUNT(p.id_producto) AS total_productos
    FROM artesanos a
    JOIN usuarios u ON a.id_usuario = u.id_usuario
    LEFT JOIN productos p ON p.id_artesano = a.id_artesano
    GROUP BY a.id_artesano, u.id_usuario, u.nombre, u.email, u.estado
    ORDER BY a.fecha_registro DESC
  `);
  return result.rows;
};

const getArtesanoById = async (id) => {
  const result = await db.query(`
    SELECT a.id_artesano, a.estado AS region, a.descripcion, a.fecha_registro,
           u.id_usuario, u.nombre, u.email, u.estado,
           COUNT(p.id_producto) AS total_productos
    FROM artesanos a
    JOIN usuarios u ON a.id_usuario = u.id_usuario
    LEFT JOIN productos p ON p.id_artesano = a.id_artesano
    WHERE a.id_artesano = $1
    GROUP BY a.id_artesano, u.id_usuario, u.nombre, u.email, u.estado
  `, [id]);
  return result.rows[0];
};

// Admin: crear artesano completo (usuario + perfil artesano)
const crearArtesano = async (nombre, email, passwordHash, descripcion, region) => {
  // 1. Crear usuario con rol artesano y estado activo (creado por admin = aprobado)
  const usuarioResult = await db.query(
    `INSERT INTO usuarios (nombre, email, password, rol, estado)
     VALUES ($1, $2, $3, 'artesano', 'activo')
     RETURNING id_usuario, nombre, email, rol, estado`,
    [nombre, email, passwordHash]
  );
  const usuario = usuarioResult.rows[0];

  // 2. Crear perfil de artesano
  const artesanoResult = await db.query(
    `INSERT INTO artesanos (id_usuario, descripcion, estado)
     VALUES ($1, $2, $3)
     RETURNING id_artesano`,
    [usuario.id_usuario, descripcion || null, region || null]
  );

  return { ...usuario, id_artesano: artesanoResult.rows[0].id_artesano };
};

// Admin: actualizar datos de artesano (perfil + usuario)
const actualizarArtesano = async (id_artesano, { nombre, email, descripcion, region, estado }) => {
  // Actualizar perfil artesano
  await db.query(
    `UPDATE artesanos SET descripcion = $1, estado = $2 WHERE id_artesano = $3`,
    [descripcion, region, id_artesano]
  );

  // Actualizar usuario asociado
  const result = await db.query(
    `UPDATE usuarios u SET nombre = $1, email = $2, estado = $3
     FROM artesanos a
     WHERE a.id_artesano = $4 AND u.id_usuario = a.id_usuario
     RETURNING u.id_usuario, u.nombre, u.email, u.estado`,
    [nombre, email, estado, id_artesano]
  );
  return result.rows[0];
};

// Admin: eliminar artesano (elimina el usuario y en cascada el perfil)
const eliminarArtesano = async (id_artesano) => {
  // Obtener id_usuario primero
  const res = await db.query(
    'SELECT id_usuario FROM artesanos WHERE id_artesano = $1', [id_artesano]
  );
  if (res.rows[0]) {
    await db.query('DELETE FROM usuarios WHERE id_usuario = $1', [res.rows[0].id_usuario]);
  }
};

module.exports = { getArtesanos, getArtesanoById, crearArtesano, actualizarArtesano, eliminarArtesano };