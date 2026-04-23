const productoModel = require('../models/producto.model');

const getProductos = async (req, res) => {
  try {
    const productos = await productoModel.getProductos();
    res.json(productos);
  } catch (error) {
    console.error('Error en controller:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};
console.log(productoModel);
console.log(typeof productoModel.getProductos);

const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio } = req.body;

    const producto = await productoModel.crearProducto(nombre, descripcion, precio);

    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;

    const producto = await productoModel.actualizarProducto(id, nombre, descripcion, precio);

    res.json(producto);
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const eliminarProducto = async (req, res) => {    
    try {   
        const { id } = req.params;

        await productoModel.eliminarProducto(id);   
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }  
};  

module.exports = {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};