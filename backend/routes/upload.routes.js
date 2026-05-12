const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const upload   = require('../middlewares/upload.middleware');
const { verificarToken } = require('../middlewares/auth.middleware');

// POST /api/upload/:tipo  (tipo = 'productos' | 'artesanos')
// Requiere token válido
router.post('/:tipo', verificarToken, (req, res) => {
  const tipo = req.params.tipo;

  if (!['productos', 'artesanos'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido. Usa "productos" o "artesanos".' });
  }

  upload.single('imagen')(req, res, (err) => {
    if (err) {
      // Error de multer (tipo incorrecto, tamaño excedido, etc.)
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
    }

    // Construir URL pública
    const url = `/uploads/${tipo}/${req.file.filename}`;

    res.json({
      mensaje:  'Imagen subida correctamente',
      url,
      filename: req.file.filename,
      size:     req.file.size,
    });
  });
});

// DELETE /api/upload/:tipo/:filename  — borrar imagen anterior
router.delete('/:tipo/:filename', verificarToken, (req, res) => {
  const { tipo, filename } = req.params;

  if (!['productos', 'artesanos'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido.' });
  }

  // Seguridad: no permitir path traversal
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'Nombre de archivo inválido.' });
  }

  const filePath = path.join(__dirname, '..', 'uploads', tipo, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado.' });
  }

  fs.unlinkSync(filePath);
  res.json({ mensaje: 'Imagen eliminada correctamente.' });
});

module.exports = router;