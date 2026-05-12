const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const { verificarToken, soloArtesano } = require('../middlewares/auth.middleware');

router.get('/', productoController.getProductos);
router.get('/:id', productoController.getProductoById);
router.post('/', verificarToken, soloArtesano, productoController.crearProducto);
router.put('/:id', verificarToken, soloArtesano, productoController.actualizarProducto);
router.delete('/:id', verificarToken, soloArtesano, productoController.eliminarProducto);

module.exports = router;