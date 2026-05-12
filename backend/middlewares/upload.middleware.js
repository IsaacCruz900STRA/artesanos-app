const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// Crear carpetas si no existen
const carpetas = ['uploads/productos', 'uploads/artesanos'];
carpetas.forEach(c => {
  if (!fs.existsSync(c)) fs.mkdirSync(c, { recursive: true });
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Elegir carpeta según el tipo indicado en la ruta
    const tipo = req.params.tipo || 'productos';
    const carpeta = tipo === 'artesanos' ? 'uploads/artesanos' : 'uploads/productos';
    cb(null, carpeta);
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + nombre limpio
    const ext      = path.extname(file.originalname).toLowerCase();
    const nombre   = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    const filename = `${Date.now()}-${nombre}${ext}`;
    cb(null, filename);
  },
});

// Filtro: solo imágenes
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp|gif/;
  const extOk  = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = tiposPermitidos.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp, gif)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
});

module.exports = upload;