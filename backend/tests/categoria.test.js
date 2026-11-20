
jest.mock('../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

jest.mock('../models/categoria.model', () => ({
  getCategorias: jest.fn(),
  getCategoriaById: jest.fn()
}));

const request = require('supertest');
const app = require('../app');
const categoriaModel = require('../models/categoria.model');

describe('Pruebas de categorías', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/categorias debe responder 200', async () => {
    categoriaModel.getCategorias.mockResolvedValue([
      { id: 1, nombre: 'Cerámica' }
    ]);

    const response = await request(app).get('/api/categorias');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test('GET /api/categorias/:id debe responder 404 si no existe', async () => {
    categoriaModel.getCategoriaById.mockResolvedValue(null);

    const response = await request(app).get('/api/categorias/999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/categorias debe responder 500 si ocurre un error', async () => {
    categoriaModel.getCategorias.mockRejectedValue(
      new Error('Error de prueba')
    );

    const response = await request(app).get('/api/categorias');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

});
