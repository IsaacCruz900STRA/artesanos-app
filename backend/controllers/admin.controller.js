const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuario.model');
const artesanoModel = require('../models/artesano.model');
const productoModel = require('../models/producto.model');

// ── Stats ──
const getStats = async (req, res) => {
  try {
    const stats    = await usuarioModel.getStats();
    const productos = await productoModel.getProductos();
    res.json({ ...stats, total_productos: productos.length });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error al obtener estadísticas' }); }
};

// ────────────────────────────────────────────
// CRUD USUARIOS
// ────────────────────────────────────────────
const getUsuarios = async (req, res) => {
  try {
    res.json(await usuarioModel.getTodosLosUsuarios());
  } catch (e) { res.status(500).json({ error: 'Error al obtener usuarios' }); }
};

const getUsuarioById = async (req, res) => {
  try {
    const usuario = await usuarioModel.buscarPorId(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (e) { res.status(500).json({ error: 'Error al obtener usuario' }); }
};

// Admin crea usuario directamente (activo, cualquier rol)
const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol, estado } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'nombre, email, password y rol son requeridos' });
    }
    const existe = await usuarioModel.buscarPorEmail(email);
    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

    const hash   = await bcrypt.hash(password, 10);
    const usuario = await usuarioModel.crearUsuario(nombre, email, hash, rol);

    // Si el admin lo crea, forzar estado activo (no pendiente)
    if (estado || rol !== 'artesano') {
      await usuarioModel.cambiarEstado(usuario.id_usuario, estado || 'activo');
    }

    // Crear perfil extra si aplica
    const db = require('../config/db');
    if (rol === 'cliente')  await db.query('INSERT INTO clientes  (id_usuario) VALUES ($1)', [usuario.id_usuario]);
    if (rol === 'artesano') await db.query('INSERT INTO artesanos (id_usuario) VALUES ($1)', [usuario.id_usuario]);

    res.status(201).json({ ...usuario, estado: estado || 'activo' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error al crear usuario' }); }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, estado } = req.body;
    if (!nombre || !email || !rol || !estado) {
      return res.status(400).json({ error: 'nombre, email, rol y estado son requeridos' });
    }
    const usuario = await usuarioModel.actualizarUsuario(id, { nombre, email, rol, estado });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error al actualizar usuario' }); }
};

const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!['activo','pendiente','desactivado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    const usuario = await usuarioModel.cambiarEstado(id, estado);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: `Usuario ${estado} correctamente`, usuario });
  } catch (e) { res.status(500).json({ error: 'Error al cambiar estado' }); }
};

const eliminarUsuario = async (req, res) => {
  try {
    await usuarioModel.eliminarUsuario(req.params.id);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (e) { res.status(500).json({ error: 'Error al eliminar usuario' }); }
};

// ────────────────────────────────────────────
// CRUD ARTESANOS
// ────────────────────────────────────────────
const getArtesanos = async (req, res) => {
  try {
    res.json(await artesanoModel.getArtesanos());
  } catch (e) { res.status(500).json({ error: 'Error al obtener artesanos' }); }
};

const getArtesanoById = async (req, res) => {
  try {
    const artesano = await artesanoModel.getArtesanoById(req.params.id);
    if (!artesano) return res.status(404).json({ error: 'Artesano no encontrado' });
    res.json(artesano);
  } catch (e) { res.status(500).json({ error: 'Error al obtener artesano' }); }
};

// Admin crea artesano completo (usuario + perfil) con estado activo directamente
const crearArtesano = async (req, res) => {
  try {
    const { nombre, email, password, descripcion, region } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son requeridos' });
    }
    const existe = await usuarioModel.buscarPorEmail(email);
    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

    const hash     = await bcrypt.hash(password, 10);
    const artesano = await artesanoModel.crearArtesano(nombre, email, hash, descripcion, region);
    res.status(201).json(artesano);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error al crear artesano' }); }
};

const actualizarArtesano = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, descripcion, region, estado } = req.body;
    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son requeridos' });
    }
    const artesano = await artesanoModel.actualizarArtesano(id, { nombre, email, descripcion, region, estado });
    if (!artesano) return res.status(404).json({ error: 'Artesano no encontrado' });
    res.json(artesano);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error al actualizar artesano' }); }
};

const eliminarArtesano = async (req, res) => {
  try {
    await artesanoModel.eliminarArtesano(req.params.id);
    res.json({ mensaje: 'Artesano eliminado correctamente' });
  } catch (e) { res.status(500).json({ error: 'Error al eliminar artesano' }); }
};

// ────────────────────────────────────────────
// PRODUCTOS (solo lectura + eliminar)
// ────────────────────────────────────────────
const getProductos = async (req, res) => {
  try {
    res.json(await productoModel.getProductos());
  } catch (e) { res.status(500).json({ error: 'Error al obtener productos' }); }
};

const eliminarProducto = async (req, res) => {
  try {
    await productoModel.eliminarProducto(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (e) { res.status(500).json({ error: 'Error al eliminar producto' }); }
};

const getPendientes = async (req, res) => {
  try {
    res.json(await usuarioModel.getArtesanosPendientes());
  } catch (e) { res.status(500).json({ error: 'Error al obtener pendientes' }); }
};

module.exports = {
  getStats,
  getUsuarios, getUsuarioById, crearUsuario, actualizarUsuario, cambiarEstado, eliminarUsuario,
  getArtesanos, getArtesanoById, crearArtesano, actualizarArtesano, eliminarArtesano,
  getProductos, eliminarProducto,
  getPendientes,
};