const Product = require('../models/Product');

const obtenerProductos = async (req, res) => {
  try {
    const productos = await Product.find().populate('creadoPor', 'nombre email');
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudieron cargar los productos.', error: error.message });
  }
};

const obtenerProducto = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id).populate('creadoPor', 'nombre email');
    if (!producto) {
      return res.status(404).json({ mensaje: 'No se encontró el producto.' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Hubo un error al buscar el producto.', error: error.message });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, stock } = req.body;

    const producto = new Product({
      nombre,
      descripcion,
      precio,
      categoria,
      stock,
      creadoPor: req.usuario.id
    });

    await producto.save();
    res.status(201).json({ mensaje: 'Producto creado correctamente.', producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo crear el producto.', error: error.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({ mensaje: 'No existe ese producto.' });
    }

    res.json({ mensaje: 'Producto actualizado.', producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Fallo al actualizar el producto.', error: error.message });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const producto = await Product.findByIdAndDelete(req.params.id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto.', error: error.message });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
