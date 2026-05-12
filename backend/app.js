const express = require('express');
const cors    = require('cors');
const path    = require('path');
const app     = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Servir imágenes estáticas ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rutas API ──
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/productos', require('./routes/producto.routes'));
app.use('/api/categorias',require('./routes/categoria.routes'));
app.use('/api/artesanos', require('./routes/artesano.routes'));
app.use('/api/admin',     require('./routes/admin.routes'));
app.use('/api/upload',    require('./routes/upload.routes'));

module.exports = app;