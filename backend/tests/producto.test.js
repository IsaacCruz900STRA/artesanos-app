
const request = require('supertest');
const express = require('express');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

jest.mock('../models/producto.model', () => ({
  getProductos: jest.fn(),
  getProductoById: jest.fn(),
  crearProducto: jest.fn(),
  actualizarProducto: jest.fn(),
  eliminarProducto: jest.fn()
}));

const db = require('../config/db');
const productoModel = require('../models/producto.model');
const productoController = require('../controllers/producto.controller');

const app = express();
app.use(express.json());

app.get('/productos', productoController.getProductos);
app.get('/productos/:id', productoController.getProductoById);
app.post('/productos', (req, res, next) => {
  req.usuario = { id: 10 };
  next();
}, productoController.crearProducto);
app.put('/productos/:id', productoController.actualizarProducto);
app.delete('/productos/:id', productoController.eliminarProducto);

describe('Pruebas de producto.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET productos: obtener todos', async () => {
    productoModel.getProductos.mockResolvedValue([{ id_producto: 1 }]);

    const res = await request(app).get('/productos');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET productos: error 500', async () => {
    productoModel.getProductos.mockRejectedValue(new Error('Error DB'));

    const res = await request(app).get('/productos');

    expect(res.status).toBe(500);
  });

  test('GET producto por ID: encontrado', async () => {
    productoModel.getProductoById.mockResolvedValue({ id_producto: 1 });

    const res = await request(app).get('/productos/1');

    expect(res.status).toBe(200);
  });

  test('GET producto por ID: no encontrado', async () => {
    productoModel.getProductoById.mockResolvedValue(null);

    const res = await request(app).get('/productos/99');

    expect(res.status).toBe(404);
  });

  test('GET producto por ID: error 500', async () => {
    productoModel.getProductoById.mockRejectedValue(new Error('Error DB'));

    const res = await request(app).get('/productos/1');

    expect(res.status).toBe(500);
  });

  test('POST producto: creación exitosa', async () => {
    db.query.mockResolvedValue({ rows: [{ id_artesano: 5 }] });
    productoModel.crearProducto.mockResolvedValue({ id_producto: 1 });

    const res = await request(app)
      .post('/productos')
      .send({ nombre: 'Artesanía', precio: 100 });

    expect(res.status).toBe(201);
    expect(productoModel.crearProducto).toHaveBeenCalled();
  });

  test('POST producto: artesano inexistente', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/productos')
      .send({ nombre: 'Artesanía', precio: 100 });

    expect(res.status).toBe(403);
  });

  test('POST producto: error 500', async () => {
    db.query.mockRejectedValue(new Error('Error DB'));

    const res = await request(app)
      .post('/productos')
      .send({ nombre: 'Artesanía', precio: 100 });

    expect(res.status).toBe(500);
  });

  test('PUT producto: actualización exitosa', async () => {
    productoModel.actualizarProducto.mockResolvedValue({ id_producto: 1 });

    const res = await request(app)
      .put('/productos/1')
      .send({ nombre: 'Nuevo nombre' });

    expect(res.status).toBe(200);
  });

  test('PUT producto: no encontrado', async () => {
    productoModel.actualizarProducto.mockResolvedValue(null);

    const res = await request(app)
      .put('/productos/99')
      .send({ nombre: 'Nuevo nombre' });

    expect(res.status).toBe(404);
  });

  test('PUT producto: error 500', async () => {
    productoModel.actualizarProducto.mockRejectedValue(new Error('Error DB'));

    const res = await request(app)
      .put('/productos/1')
      .send({ nombre: 'Nuevo nombre' });

    expect(res.status).toBe(500);
  });

  test('DELETE producto: eliminación exitosa', async () => {
    productoModel.eliminarProducto.mockResolvedValue({});

    const res = await request(app).delete('/productos/1');

    expect(res.status).toBe(200);
  });

  test('DELETE producto: error 500', async () => {
    productoModel.eliminarProducto.mockRejectedValue(new Error('Error DB'));

    const res = await request(app).delete('/productos/1');

    expect(res.status).toBe(500);
  });
});
