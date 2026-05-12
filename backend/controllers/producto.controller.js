const productoModel = require('../models/producto.model');

const getProductos = async (req, res) => {
  try {
    res.json(await productoModel.getProductos());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const getProductoById = async (req, res) => {
  try {
    const producto = await productoModel.getProductoById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, id_categoria, imagen_url } = req.body;
    const id_usuario = req.usuario?.id;

    // Buscar el id_artesano real a partir del id_usuario del token
    const db = require('../config/db');
    const artesanoRes = await db.query(
      'SELECT id_artesano FROM artesanos WHERE id_usuario = $1', [id_usuario]
    );

    if (!artesanoRes.rows[0]) {
      return res.status(403).json({ error: 'No se encontró perfil de artesano para este usuario' });
    }

    const id_artesano = artesanoRes.rows[0].id_artesano;
    const producto = await productoModel.crearProducto(
      nombre, descripcion, precio, id_categoria, id_artesano, imagen_url
    );
    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, id_categoria, imagen_url } = req.body;
    const producto = await productoModel.actualizarProducto(
      id, nombre, descripcion, precio, id_categoria, imagen_url
    );
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    await productoModel.eliminarProducto(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto };