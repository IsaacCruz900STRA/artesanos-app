
const request = require('supertest');
const express = require('express');

jest.mock('../models/artesano.model', () => ({
  getArtesanos: jest.fn(),
  getArtesanoById: jest.fn()
}));

const artesanoModel = require('../models/artesano.model');
const artesanoController = require('../controllers/artesano.controller');

const app = express();
app.use(express.json());

app.get('/artesanos', artesanoController.getArtesanos);
app.get('/artesanos/:id', artesanoController.getArtesanoById);

describe('Pruebas de artesano.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET artesanos: obtener todos', async () => {
    artesanoModel.getArtesanos.mockResolvedValue([
      { id_artesano: 1, nombre: 'Artesano 1' }
    ]);

    const res = await request(app).get('/artesanos');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET artesanos: error 500', async () => {
    artesanoModel.getArtesanos.mockRejectedValue(new Error('Error DB'));

    const res = await request(app).get('/artesanos');

    expect(res.status).toBe(500);
  });

  test('GET artesano por ID: encontrado', async () => {
    artesanoModel.getArtesanoById.mockResolvedValue({
      id_artesano: 1,
      nombre: 'Artesano 1'
    });

    const res = await request(app).get('/artesanos/1');

    expect(res.status).toBe(200);
    expect(res.body.id_artesano).toBe(1);
  });

  test('GET artesano por ID: no encontrado', async () => {
    artesanoModel.getArtesanoById.mockResolvedValue(null);

    const res = await request(app).get('/artesanos/99');

    expect(res.status).toBe(404);
  });

  test('GET artesano por ID: error 500', async () => {
    artesanoModel.getArtesanoById.mockRejectedValue(new Error('Error DB'));

    const res = await request(app).get('/artesanos/1');

    expect(res.status).toBe(500);
  });
});
