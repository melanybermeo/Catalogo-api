// Tareas 17 y 18: registro e inicio de sesión.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const AppError = require('../utils/AppError');
const { exito } = require('../utils/respuesta');
const { esTextoNoVacio, esCorreoValido } = require('../utils/validaciones');
const { secreto, expiraEn, algoritmo } = require('../config/jwt');

const RONDAS_BCRYPT = 10;
const MIN_PASSWORD = 8;

// POST /api/auth/registro  → 201
const registrar = async (req, res) => {
  // Solo se leen estos tres campos. Si el cliente manda "rol": "admin", se ignora.
  const { nombre, correo, password } = req.body || {};

  // 400: faltan campos obligatorios
  const faltantes = [];
  if (!esTextoNoVacio(nombre)) faltantes.push('nombre');
  if (!esTextoNoVacio(correo)) faltantes.push('correo');
  if (!esTextoNoVacio(password)) faltantes.push('password');
  if (faltantes.length) {
    throw new AppError(400, 'CAMPOS_OBLIGATORIOS', 'Faltan campos obligatorios', faltantes);
  }

  // 422: los campos llegaron, pero su contenido no es válido
  const invalidos = [];
  if (!esCorreoValido(correo)) invalidos.push('correo: formato inválido');
  if (password.length < MIN_PASSWORD) invalidos.push(`password: mínimo ${MIN_PASSWORD} caracteres`);
  if (nombre.trim().length > 100) invalidos.push('nombre: máximo 100 caracteres');
  if (invalidos.length) {
    throw new AppError(422, 'DATOS_INVALIDOS', 'Hay datos con formato inválido', invalidos);
  }

  const correoNormalizado = correo.trim().toLowerCase();

  // 409: correo ya registrado
  if (await Usuario.buscarPorCorreo(correoNormalizado)) {
    throw new AppError(409, 'CORREO_DUPLICADO', 'El correo ya está registrado');
  }

  const passwordHash = await bcrypt.hash(password, RONDAS_BCRYPT);

  let usuario;
  try {
    usuario = await Usuario.crear({
      nombre: nombre.trim(),
      correo: correoNormalizado,
      passwordHash,
      rol: 'usuario', // SIEMPRE usuario desde el registro público
    });
  } catch (err) {
    // Por si dos registros iguales llegan al mismo tiempo (índice UNIQUE)
    if (err.code === '23505') throw new AppError(409, 'CORREO_DUPLICADO', 'El correo ya está registrado');
    throw err;
  }

  return exito(res, 201, usuario, 'Usuario registrado correctamente');
};

// POST /api/auth/login  → 200
const iniciarSesion = async (req, res) => {
  const { correo, password } = req.body || {};

  if (!esTextoNoVacio(correo) || !esTextoNoVacio(password)) {
    throw new AppError(400, 'CAMPOS_OBLIGATORIOS', 'Correo y password son obligatorios');
  }

  const usuario = await Usuario.buscarPorCorreoConHash(correo.trim().toLowerCase());

  // Mismo mensaje si el correo no existe o si la contraseña está mal:
  // así no se revela qué correos están registrados.
  const coincide = usuario ? await bcrypt.compare(password, usuario.password_hash) : false;
  if (!coincide) {
    throw new AppError(401, 'CREDENCIALES_INCORRECTAS', 'Correo o contraseña incorrectos');
  }

  const token = jwt.sign({ rol: usuario.rol }, secreto, {
    subject: String(usuario.id), // "sub" = id del usuario
    expiresIn: expiraEn,          // agrega "exp" al token
    algorithm: algoritmo,
  });

  // Nunca se devuelve el hash
  const { password_hash, ...usuarioPublico } = usuario;

  return exito(res, 200, { token, tipo: 'Bearer', expiraEn, usuario: usuarioPublico }, 'Inicio de sesión correcto');
};

module.exports = { registrar, iniciarSesion };
