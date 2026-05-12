const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const db = require('../config/db');

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si ya existe
    const existe = await usuarioModel.buscarPorEmail(email);
    if (existe) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario (artesanos entran como 'pendiente' automáticamente en el model)
    const usuario = await usuarioModel.crearUsuario(nombre, email, hash, rol || 'cliente');

    // Crear perfil extra según rol
    if (usuario.rol === 'cliente') {
      await db.query('INSERT INTO clientes (id_usuario) VALUES ($1)', [usuario.id_usuario]);
    } else if (usuario.rol === 'artesano') {
      await db.query('INSERT INTO artesanos (id_usuario) VALUES ($1)', [usuario.id_usuario]);
    }

    // Si es artesano, no generar token todavía — debe esperar aprobación
    if (usuario.rol === 'artesano') {
      return res.status(201).json({
        usuario: {
          id:     usuario.id_usuario,
          nombre: usuario.nombre,
          email:  usuario.email,
          rol:    usuario.rol,
          estado: usuario.estado,
        },
        pendiente: true,
        mensaje: 'Tu cuenta está pendiente de aprobación. Te notificaremos cuando sea activada.',
      });
    }

    // Generar token para clientes y admins
    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      usuario: {
        id:     usuario.id_usuario,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol,
        estado: usuario.estado,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar contraseña
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Bloquear si está desactivado
    if (usuario.estado === 'desactivado') {
      return res.status(403).json({ error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
    }

    // Artesano pendiente — puede iniciar sesión pero con aviso
    if (usuario.rol === 'artesano' && usuario.estado === 'pendiente') {
      return res.status(403).json({
        error: 'Tu cuenta está pendiente de aprobación por el administrador.',
        estado: 'pendiente',
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.rol, estado: usuario.estado },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      usuario: {
        id:     usuario.id_usuario,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol,
        estado: usuario.estado,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };