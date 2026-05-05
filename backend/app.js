const express = require('express');
const app = express();



const productoRoutes = require('./routes/producto.routes');

app.use('/productos', productoRoutes);
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});