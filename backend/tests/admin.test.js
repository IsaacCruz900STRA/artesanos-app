
const request = require('supertest');
const express = require('express');

jest.mock('bcrypt', () => ({
  hash: jest.fn()
}));

jest.mock('../models/usuario.model', () => ({
  getStats: jest.fn(),
  getTodosLosUsuarios: jest.fn(),
  buscarPorId: jest.fn(),
  buscarPorEmail: jest.fn(),
  crearUsuario: jest.fn(),
  cambiarEstado: jest.fn(),
  actualizarUsuario: jest.fn(),
  eliminarUsuario: jest.fn(),
  getArtesanosPendientes: jest.fn()
}));

jest.mock('../models/artesano.model', () => ({
  getArtesanos: jest.fn(),
  getArtesanoById: jest.fn(),
  crearArtesano: jest.fn(),
  actualizarArtesano: jest.fn(),
  eliminarArtesano: jest.fn()
}));

jest.mock('../models/producto.model', () => ({
  getProductos: jest.fn(),
  eliminarProducto: jest.fn()
}));

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const bcrypt = require('bcrypt');
const db = require('../config/db');
const usuarioModel = require('../models/usuario.model');
const artesanoModel = require('../models/artesano.model');
const productoModel = require('../models/producto.model');
const admin = require('../controllers/admin.controller');

const app = express();
app.use(express.json());

app.get('/stats', admin.getStats);
app.get('/usuarios', admin.getUsuarios);
app.get('/usuarios/:id', admin.getUsuarioById);
app.post('/usuarios', admin.crearUsuario);
app.put('/usuarios/:id', admin.actualizarUsuario);
app.patch('/usuarios/:id/estado', admin.cambiarEstado);
app.delete('/usuarios/:id', admin.eliminarUsuario);

app.get('/artesanos', admin.getArtesanos);
app.get('/artesanos/:id', admin.getArtesanoById);
app.post('/artesanos', admin.crearArtesano);
app.put('/artesanos/:id', admin.actualizarArtesano);
app.delete('/artesanos/:id', admin.eliminarArtesano);

app.get('/productos', admin.getProductos);
app.delete('/productos/:id', admin.eliminarProducto);
app.get('/pendientes', admin.getPendientes);

describe('Pruebas de admin.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bcrypt.hash.mockResolvedValue('password-hash');
  });

  test('GET stats: correcto', async () => {
    usuarioModel.getStats.mockResolvedValue({ total_usuarios: 5 });
    productoModel.getProductos.mockResolvedValue([{}, {}]);

    const res = await request(app).get('/stats');

    expect(res.status).toBe(200);
    expect(res.body.total_productos).toBe(2);
  });

  test('GET stats: error 500', async () => {
    usuarioModel.getStats.mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/stats');

    expect(res.status).toBe(500);
  });

  test('GET usuarios: correcto', async () => {
    usuarioModel.getTodosLosUsuarios.mockResolvedValue([{}]);

    const res = await request(app).get('/usuarios');

    expect(res.status).toBe(200);
  });

  test('GET usuarios: error 500', async () => {
    usuarioModel.getTodosLosUsuarios.mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/usuarios');

    expect(res.status).toBe(500);
  });

  test('GET usuario por ID: encontrado', async () => {
    usuarioModel.buscarPorId.mockResolvedValue({ id_usuario: 1 });

    const res = await request(app).get('/usuarios/1');

    expect(res.status).toBe(200);
  });

  test('GET usuario por ID: no encontrado', async () => {
    usuarioModel.buscarPorId.mockResolvedValue(null);

    const res = await request(app).get('/usuarios/99');

    expect(res.status).toBe(404);
  });

  test('GET usuario por ID: error 500', async () => {
    usuarioModel.buscarPorId.mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/usuarios/1');

    expect(res.status).toBe(500);
  });

  test('POST usuario: campos requeridos', async () => {
    const res = await request(app).post('/usuarios').send({});

    expect(res.status).toBe(400);
  });

  test('POST usuario: email existente', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue({ id_usuario: 1 });

    const res = await request(app).post('/usuarios').send({
      nombre: 'Ana',
      email: 'ana@test.com',
      password: '123456',
      rol: 'cliente'
    });

    expect(res.status).toBe(400);
  });

  test('POST usuario: cliente creado', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue(null);
    usuarioModel.crearUsuario.mockResolvedValue({ id_usuario: 2 });
    usuarioModel.cambiarEstado.mockResolvedValue({});
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app).post('/usuarios').send({
      nombre: 'Ana',
      email: 'ana@test.com',
      password: '123456',
      rol: 'cliente'
    });

    expect(res.status).toBe(201);
    expect(db.query).toHaveBeenCalled();
  });

  test('POST usuario: artesano creado', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue(null);
    usuarioModel.crearUsuario.mockResolvedValue({ id_usuario: 3 });
    usuarioModel.cambiarEstado.mockResolvedValue({});
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app).post('/usuarios').send({
      nombre: 'Luis',
      email: 'luis@test.com',
      password: '123456',
      rol: 'artesano'
    });

    expect(res.status).toBe(201);
  });

  test('POST usuario: error 500', async () => {
    usuarioModel.buscarPorEmail.mockRejectedValue(new Error('DB'));

    const res = await request(app).post('/usuarios').send({
      nombre: 'Ana',
      email: 'ana@test.com',
      password: '123456',
      rol: 'cliente'
    });

    expect(res.status).toBe(500);
  });

  test('PUT usuario: campos requeridos', async () => {
    const res = await request(app).put('/usuarios/1').send({});

    expect(res.status).toBe(400);
  });

  test('PUT usuario: actualizado', async () => {
    usuarioModel.actualizarUsuario.mockResolvedValue({ id_usuario: 1 });

    const res = await request(app).put('/usuarios/1').send({
      nombre: 'Ana',
      email: 'ana@test.com',
      rol: 'cliente',
      estado: 'activo'
    });

    expect(res.status).toBe(200);
  });

  test('PUT usuario: no encontrado', async () => {
    usuarioModel.actualizarUsuario.mockResolvedValue(null);

    const res = await request(app).put('/usuarios/1').send({
      nombre: 'Ana',
      email: 'ana@test.com',
      rol: 'cliente',
      estado: 'activo'
    });

    expect(res.status).toBe(404);
  });

  test('PUT usuario: error 500', async () => {
    usuarioModel.actualizarUsuario.mockRejectedValue(new Error('DB'));

    const res = await request(app).put('/usuarios/1').send({
      nombre: 'Ana',
      email: 'ana@test.com',
      rol: 'cliente',
      estado: 'activo'
    });

    expect(res.status).toBe(500);
  });

  test('PATCH estado: inválido', async () => {
    const res = await request(app).patch('/usuarios/1/estado')
      .send({ estado: 'otro' });

    expect(res.status).toBe(400);
  });

  test('PATCH estado: actualizado', async () => {
    usuarioModel.cambiarEstado.mockResolvedValue({ id_usuario: 1 });

    const res = await request(app).patch('/usuarios/1/estado')
      .send({ estado: 'activo' });

    expect(res.status).toBe(200);
  });

  test('PATCH estado: no encontrado', async () => {
    usuarioModel.cambiarEstado.mockResolvedValue(null);

    const res = await request(app).patch('/usuarios/1/estado')
      .send({ estado: 'activo' });

    expect(res.status).toBe(404);
  });

  test('PATCH estado: error 500', async () => {
    usuarioModel.cambiarEstado.mockRejectedValue(new Error('DB'));

    const res = await request(app).patch('/usuarios/1/estado')
      .send({ estado: 'activo' });

    expect(res.status).toBe(500);
  });

  test('DELETE usuario: correcto', async () => {
    usuarioModel.eliminarUsuario.mockResolvedValue({});

    const res = await request(app).delete('/usuarios/1');

    expect(res.status).toBe(200);
  });

  test('DELETE usuario: error 500', async () => {
    usuarioModel.eliminarUsuario.mockRejectedValue(new Error('DB'));

    const res = await request(app).delete('/usuarios/1');

    expect(res.status).toBe(500);
  });

  test('GET artesanos: correcto', async () => {
    artesanoModel.getArtesanos.mockResolvedValue([{}]);

    const res = await request(app).get('/artesanos');

    expect(res.status).toBe(200);
  });

  test('GET artesanos: error 500', async () => {
    artesanoModel.getArtesanos.mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/artesanos');

    expect(res.status).toBe(500);
  });

  test('GET artesano por ID: encontrado', async () => {
    artesanoModel.getArtesanoById.mockResolvedValue({ id_artesano: 1 });

    const res = await request(app).get('/artesanos/1');

    expect(res.status).toBe(200);
  });

  test('GET artesano por ID: no encontrado', async () => {
    artesanoModel.getArtesanoById.mockResolvedValue(null);

    const res = await request(app).get('/artesanos/1');

    expect(res.status).toBe(404);
  });

  test('GET artesano por ID: error 500', async () => {
    artesanoModel.getArtesanoById.mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/artesanos/1');

    expect(res.status).toBe(500);
  });

  test('POST artesano: campos requeridos', async () => {
    const res = await request(app).post('/artesanos').send({});

    expect(res.status).toBe(400);
  });

  test('POST artesano: email existente', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue({ id_usuario: 1 });

    const res = await request(app).post('/artesanos').send({
      nombre: 'Luis',
      email: 'luis@test.com',
      password: '123456'
    });

    expect(res.status).toBe(400);
  });

  test('POST artesano: creado', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue(null);
    artesanoModel.crearArtesano.mockResolvedValue({ id_artesano: 1 });

    const res = await request(app).post('/artesanos').send({
      nombre: 'Luis',
      email: 'luis@test.com',
      password: '123456'
    });

    expect(res.status).toBe(201);
  });

  test('POST artesano: error 500', async () => {
    usuarioModel.buscarPorEmail.mockRejectedValue(new Error('DB'));

    const res = await request(app).post('/artesanos').send({
      nombre: 'Luis',
      email: 'luis@test.com',
      password: '123456'
    });

    expect(res.status).toBe(500);
  });

  test('PUT artesano: campos requeridos', async () => {
    const res = await request(app).put('/artesanos/1').send({});

    expect(res.status).toBe(400);
  });

  test('PUT artesano: actualizado', async () => {
    artesanoModel.actualizarArtesano.mockResolvedValue({ id_artesano: 1 });

    const res = await request(app).put('/artesanos/1').send({
      nombre: 'Luis',
      email: 'luis@test.com'
    });

    expect(res.status).toBe(200);
  });

  test('PUT artesano: no encontrado', async () => {
    artesanoModel.actualizarArtesano.mockResolvedValue(null);

    const res = await request(app).put('/artesanos/1').send({
      nombre: 'Luis',
      email: 'luis@test.com'
    });

    expect(res.status).toBe(404);
  });

  test('PUT artesano: error 500', async () => {
    artesanoModel.actualizarArtesano.mockRejectedValue(new Error('DB'));

    const res = await request(app).put('/artesanos/1').send({
      nombre: 'Luis',
      email: 'luis@test.com'
    });

    expect(res.status).toBe(500);
  });

  test('DELETE artesano: correcto', async () => {
    artesanoModel.eliminarArtesano.mockResolvedValue({});

    const res = await request(app).delete('/artesanos/1');

    expect(res.status).toBe(200);
  });

  test('DELETE artesano: error 500', async () => {
    artesanoModel.eliminarArtesano.mockRejectedValue(new Error('DB'));

    const res = await request(app).delete('/artesanos/1');

    expect(res.status).toBe(500);
  });

  test('GET productos: correcto', async () => {
    productoModel.getProductos.mockResolvedValue([{}]);

    const res = await request(app).get('/productos');

    expect(res.status).toBe(200);
  });

  test('GET productos: error 500', async () => {
    productoModel.getProductos.mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/productos');

    expect(res.status).toBe(500);
  });

  test('DELETE producto: correcto', async () => {
    productoModel.eliminarProducto.mockResolvedValue({});

    const res = await request(app).delete('/productos/1');

    expect(res.status).toBe(200);
  });

  test('DELETE producto: error 500', async () => {
    productoModel.eliminarProducto.mockRejectedValue(new Error('DB'));

    const res = await request(app).delete('/productos/1');

    expect(res.status).toBe(500);
  });

  test('GET pendientes: correcto', async () => {
    usuarioModel.getArtesanosPendientes.mockResolvedValue([{}]);

    const res = await request(app).get('/pendientes');

    expect(res.status).toBe(200);
  });

  test('GET pendientes: error 500', async () => {
    usuarioModel.getArtesanosPendientes.mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/pendientes');

    expect(res.status).toBe(500);
  });
});
