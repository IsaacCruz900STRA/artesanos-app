const express = require('express');
const router  = express.Router();
const admin   = require('../controllers/admin.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.use(verificarToken, soloAdmin);

// Stats
router.get('/stats', admin.getStats);

// Artesanos pendientes
router.get('/artesanos/pendientes', admin.getPendientes);

// CRUD Artesanos
router.get('/artesanos',          admin.getArtesanos);
router.get('/artesanos/:id',      admin.getArtesanoById);
router.post('/artesanos',         admin.crearArtesano);
router.put('/artesanos/:id',      admin.actualizarArtesano);
router.delete('/artesanos/:id',   admin.eliminarArtesano);

// CRUD Usuarios
router.get('/usuarios',           admin.getUsuarios);
router.get('/usuarios/:id',       admin.getUsuarioById);
router.post('/usuarios',          admin.crearUsuario);
router.put('/usuarios/:id',       admin.actualizarUsuario);
router.patch('/usuarios/:id/estado', admin.cambiarEstado);
router.delete('/usuarios/:id',    admin.eliminarUsuario);

// Productos
router.get('/productos',          admin.getProductos);
router.delete('/productos/:id',   admin.eliminarProducto);

module.exports = router;