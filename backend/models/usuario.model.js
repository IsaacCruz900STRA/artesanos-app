const db = require('../config/db');

const crearUsuario = async (nombre, email, password, rol) => {
  const estado = rol === 'artesano' ? 'pendiente' : 'activo';
  const result = await db.query(
    `INSERT INTO usuarios (nombre, email, password, rol, estado)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_usuario, nombre, email, rol, estado`,
    [nombre, email, password, rol, estado]
  );
  return result.rows[0];
};

const buscarPorEmail = async (email) => {
  const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

const buscarPorId = async (id) => {
  const result = await db.query(
    'SELECT id_usuario, nombre, email, rol, estado, fecha_registro FROM usuarios WHERE id_usuario = $1',
    [id]
  );
  return result.rows[0];
};

const getTodosLosUsuarios = async () => {
  const result = await db.query(
    `SELECT id_usuario, nombre, email, rol, estado, fecha_registro
     FROM usuarios ORDER BY fecha_registro DESC`
  );
  return result.rows;
};

const getArtesanosPendientes = async () => {
  const result = await db.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.estado, u.fecha_registro,
            a.descripcion, a.estado AS region
     FROM usuarios u
     JOIN artesanos a ON a.id_usuario = u.id_usuario
     WHERE u.rol = 'artesano' AND u.estado = 'pendiente'
     ORDER BY u.fecha_registro DESC`
  );
  return result.rows;
};

const cambiarEstado = async (id, estado) => {
  const result = await db.query(
    `UPDATE usuarios SET estado = $1 WHERE id_usuario = $2
     RETURNING id_usuario, nombre, email, rol, estado`,
    [estado, id]
  );
  return result.rows[0];
};

// Admin: actualizar datos de cualquier usuario
const actualizarUsuario = async (id, { nombre, email, rol, estado }) => {
  const result = await db.query(
    `UPDATE usuarios SET nombre = $1, email = $2, rol = $3, estado = $4
     WHERE id_usuario = $5
     RETURNING id_usuario, nombre, email, rol, estado`,
    [nombre, email, rol, estado, id]
  );
  return result.rows[0];
};

const eliminarUsuario = async (id) => {
  await db.query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
};

const getStats = async () => {
  const result = await db.query(`
    SELECT
      COUNT(*)                                                          AS total_usuarios,
      COUNT(*) FILTER (WHERE rol = 'cliente')                          AS total_clientes,
      COUNT(*) FILTER (WHERE rol = 'artesano')                         AS total_artesanos,
      COUNT(*) FILTER (WHERE rol = 'artesano' AND estado = 'pendiente') AS pendientes,
      COUNT(*) FILTER (WHERE rol = 'artesano' AND estado = 'activo')   AS artesanos_activos,
      COUNT(*) FILTER (WHERE rol = 'artesano' AND estado = 'desactivado') AS desactivados
    FROM usuarios
  `);
  return result.rows[0];
};

module.exports = {
  crearUsuario, buscarPorEmail, buscarPorId,
  getTodosLosUsuarios, getArtesanosPendientes,
  cambiarEstado, actualizarUsuario, eliminarUsuario, getStats,
};