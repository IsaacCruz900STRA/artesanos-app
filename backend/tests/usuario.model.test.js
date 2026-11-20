
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const db = require('../config/db');
const usuarioModel = require('../models/usuario.model');

describe('Modelo de usuarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debe crear un usuario cliente', async () => {
    db.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nombre: 'Carlos', rol: 'cliente', estado: 'activo' }]
    });

    const resultado = await usuarioModel.crearUsuario(
      'Carlos', 'carlos@test.com', '123456', 'cliente'
    );

    expect(resultado.id_usuario).toBe(1);
    expect(db.query).toHaveBeenCalled();
  });

  test('Debe crear un artesano con estado pendiente', async () => {
    db.query.mockResolvedValue({
      rows: [{ id_usuario: 2, rol: 'artesano', estado: 'pendiente' }]
    });

    const resultado = await usuarioModel.crearUsuario(
      'Ana', 'ana@test.com', '123456', 'artesano'
    );

    expect(resultado.estado).toBe('pendiente');
  });

  test('Debe buscar un usuario por correo', async () => {
    db.query.mockResolvedValue({ rows: [{ id_usuario: 1 }] });

    const resultado = await usuarioModel.buscarPorEmail(' carlos@test.com ');

    expect(resultado.id_usuario).toBe(1);
    expect(db.query).toHaveBeenCalled();
  });

  test('Debe buscar un usuario por ID', async () => {
    db.query.mockResolvedValue({ rows: [{ id_usuario: 1 }] });

    const resultado = await usuarioModel.buscarPorId(1);

    expect(resultado.id_usuario).toBe(1);
  });

  test('Debe obtener todos los usuarios', async () => {
    db.query.mockResolvedValue({ rows: [{ id_usuario: 1 }] });

    const resultado = await usuarioModel.getTodosLosUsuarios();

    expect(resultado).toHaveLength(1);
  });

  test('Debe obtener artesanos pendientes', async () => {
    db.query.mockResolvedValue({ rows: [{ id_usuario: 2 }] });

    const resultado = await usuarioModel.getArtesanosPendientes();

    expect(resultado).toHaveLength(1);
  });


  test('Debe cambiar el estado de un usuario', async () => {
    db.query.mockResolvedValue({
      rows: [{ id_usuario: 1, estado: 'desactivado' }]
    });

    const resultado = await usuarioModel.cambiarEstado(1, 'desactivado');

    expect(resultado.estado).toBe('desactivado');
  });

  test('Debe actualizar los datos de un usuario', async () => {
    db.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nombre: 'Carlos actualizado' }]
    });

    const resultado = await usuarioModel.actualizarUsuario(1, {
      nombre: 'Carlos actualizado',
      email: 'carlos@test.com',
      rol: 'cliente',
      estado: 'activo'
    });

    expect(resultado.nombre).toBe('Carlos actualizado');
  });

  test('Debe eliminar un usuario', async () => {
    db.query.mockResolvedValue({ rows: [] });

    await usuarioModel.eliminarUsuario(1);

    expect(db.query).toHaveBeenCalledWith(
      'DELETE FROM usuarios WHERE id_usuario = $1',
      [1]
    );
  });

  test('Debe obtener las estadísticas de usuarios', async () => {
    db.query.mockResolvedValue({
      rows: [{
        total_usuarios: '10',
        total_clientes: '5',
        total_artesanos: '5',
        pendientes: '2',
        artesanos_activos: '2',
        desactivados: '1'
      }]
    });

    const resultado = await usuarioModel.getStats();

    expect(resultado.total_usuarios).toBe('10');
    expect(resultado.pendientes).toBe('2');
  });



});
