const express = require('express');
const router = express.Router();
const artesanoController = require('../controllers/artesano.controller');

router.get('/', artesanoController.getArtesanos);
router.get('/:id', artesanoController.getArtesanoById);

module.exports = router;