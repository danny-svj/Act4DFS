const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existente = await User.findOne({ email });
    if (existente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado.' });
    }

    const usuario = new User({ nombre, email, password });
    await usuario.save();

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo registrar el usuario.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Hubo un problema al iniciar sesión.', error: error.message });
  }
};

const perfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo obtener el perfil.', error: error.message });
  }
};

module.exports = { registro, login, perfil };
