
jest.mock('../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

jest.mock('../models/usuario.model', () => ({
  buscarPorEmail: jest.fn(),
  crearUsuario: jest.fn()
}));

const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const usuarioModel = require('../models/usuario.model');
const db = require('../config/db');

describe('Pruebas de autenticación', () => {

  beforeAll(() => {
    process.env.JWT_SECRET = 'secreto_pruebas';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {

    test('Debe registrar un cliente correctamente', async () => {
      usuarioModel.buscarPorEmail.mockResolvedValue(null);
      usuarioModel.crearUsuario.mockResolvedValue({
        id_usuario: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        rol: 'cliente',
        estado: 'activo'
      });

      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Juan',
          email: ' JUAN@Test.com ',
          password: '123456',
          rol: 'cliente'
        });

      expect(response.status).toBe(201);
      expect(response.body.usuario.email).toBe('juan@test.com');
      expect(response.body.token).toBeDefined();
      expect(usuarioModel.crearUsuario).toHaveBeenCalled();
      expect(db.query).toHaveBeenCalled();
    });

    test('Debe registrar un artesano como pendiente', async () => {
      usuarioModel.buscarPorEmail.mockResolvedValue(null);
      usuarioModel.crearUsuario.mockResolvedValue({
        id_usuario: 2,
        nombre: 'Pedro',
        email: 'pedro@test.com',
        rol: 'artesano',
        estado: 'pendiente'
      });

      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Pedro',
          email: 'pedro@test.com',
          password: '123456',
          rol: 'artesano'
        });

      expect(response.status).toBe(201);
      expect(response.body.pendiente).toBe(true);
      expect(response.body.token).toBeUndefined();
    });

    test('No debe registrar un correo existente', async () => {
      usuarioModel.buscarPorEmail.mockResolvedValue({
        id_usuario: 1,
        email: 'juan@test.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Juan',
          email: 'juan@test.com',
          password: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(usuarioModel.crearUsuario).not.toHaveBeenCalled();
    });

    test('Debe responder 500 si ocurre un error al registrar', async () => {
      usuarioModel.buscarPorEmail.mockRejectedValue(
        new Error('Error de prueba')
      );

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Juan',
          email: 'juan@test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

  });

  describe('POST /api/auth/login', () => {

    test('Debe iniciar sesión correctamente', async () => {
      const hash = await bcrypt.hash('123456', 10);

      usuarioModel.buscarPorEmail.mockResolvedValue({
        id_usuario: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        password: hash,
        rol: 'cliente',
        estado: 'activo'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@test.com',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.usuario.rol).toBe('cliente');
    });

    test('Debe rechazar un usuario inexistente', async () => {
      usuarioModel.buscarPorEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: '123456'
        });

      expect(response.status).toBe(401);
    });

    test('Debe rechazar una contraseña incorrecta', async () => {
      const hash = await bcrypt.hash('123456', 10);

      usuarioModel.buscarPorEmail.mockResolvedValue({
        id_usuario: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        password: hash,
        rol: 'cliente',
        estado: 'activo'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@test.com',
          password: 'incorrecta'
        });

      expect(response.status).toBe(401);
    });

    test('Debe bloquear una cuenta desactivada', async () => {
      const hash = await bcrypt.hash('123456', 10);

      usuarioModel.buscarPorEmail.mockResolvedValue({
        id_usuario: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        password: hash,
        rol: 'cliente',
        estado: 'desactivado'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@test.com',
          password: '123456'
        });

      expect(response.status).toBe(403);
    });

    test('Debe bloquear un artesano pendiente', async () => {
      const hash = await bcrypt.hash('123456', 10);

      usuarioModel.buscarPorEmail.mockResolvedValue({
        id_usuario: 2,
        nombre: 'Pedro',
        email: 'pedro@test.com',
        password: hash,
        rol: 'artesano',
        estado: 'pendiente'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pedro@test.com',
          password: '123456'
        });

      expect(response.status).toBe(403);
      expect(response.body.estado).toBe('pendiente');
    });

    test('Debe responder 500 si ocurre un error al iniciar sesión', async () => {
      usuarioModel.buscarPorEmail.mockRejectedValue(
        new Error('Error de prueba')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

  });

});
