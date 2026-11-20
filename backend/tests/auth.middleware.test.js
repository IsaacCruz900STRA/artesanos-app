
const jwt = require('jsonwebtoken');
const {
  verificarToken,
  soloAdmin,
  soloArtesano
} = require('../middlewares/auth.middleware');

describe('Auth middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    process.env.JWT_SECRET = 'secreto_pruebas';
  });

  describe('verificarToken', () => {
    test('debe rechazar cuando no existe token', () => {
      verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso denegado, token requerido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debe aceptar un token válido', () => {
      const usuario = { id_usuario: 1, rol: 'admin' };
      const token = jwt.sign(usuario, process.env.JWT_SECRET);

      req.headers.authorization = `Bearer ${token}`;

      verificarToken(req, res, next);

      expect(req.usuario.id_usuario).toBe(1);
      expect(req.usuario.rol).toBe('admin');
      expect(next).toHaveBeenCalled();
    });

    test('debe rechazar un token inválido', () => {
      req.headers.authorization = 'Bearer token_invalido';

      verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido o expirado'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('soloAdmin', () => {
    test('debe permitir el acceso al administrador', () => {
      req.usuario = { rol: 'admin' };

      soloAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('debe rechazar a un usuario que no es administrador', () => {
      req.usuario = { rol: 'artesano' };

      soloAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('soloArtesano', () => {
    test('debe permitir el acceso al artesano', () => {
      req.usuario = { rol: 'artesano' };

      soloArtesano(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('debe permitir el acceso al administrador', () => {
      req.usuario = { rol: 'admin' };

      soloArtesano(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('debe rechazar a un usuario que no es artesano ni administrador', () => {
      req.usuario = { rol: 'cliente' };

      soloArtesano(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso solo para artesanos'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
