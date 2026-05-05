const express = require('express');
const router = express.Router();

const productoController = require('../backend/controllers/producto.controller');

router.get('/', productoController.getProductos);
router.post('/', productoController.createProducto);
router.put('/:id',productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);
module.exports = router;