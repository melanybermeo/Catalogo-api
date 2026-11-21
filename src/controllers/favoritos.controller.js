// Tareas 23, 24 y 25 · Favoritos del usuario autenticado (José Farías).
// REGLA (revisada en la Tarea 26): el id del usuario SIEMPRE sale del token verificado
// (req.usuario.id). Si el cliente manda "usuarioId" en el cuerpo, la URL o la consulta,
// simplemente se ignora.
const Favorito = require('../models/favorito.model');
const Producto = require('../models/producto.model');
const AppError = require('../utils/AppError');
const { exito } = require('../utils/respuesta');
const { convertirId } = require('../utils/validaciones');

// GET /api/favoritos  → 200
const listarFavoritos = async (req, res) => {
  const favoritos = await Favorito.listarPorUsuario(req.usuario.id);
  return exito(res, 200, favoritos);
};

// POST /api/favoritos  { "productoId": 1 }  → 201
const agregarFavorito = async (req, res) => {
  const { productoId } = req.body || {};

  if (productoId === undefined || productoId === null || productoId === '') {
    throw new AppError(400, 'CAMPOS_OBLIGATORIOS', 'Falta el campo obligatorio productoId', ['productoId']);
  }
  const id = convertirId(productoId);
  if (!id) throw new AppError(400, 'ID_INVALIDO', 'productoId debe ser un número entero positivo');

  // 404 si el producto no existe
  if (!(await Producto.buscarPorId(id))) {
    throw new AppError(404, 'PRODUCTO_NO_ENCONTRADO', 'El producto no existe');
  }

  try {
    const favorito = await Favorito.agregar(req.usuario.id, id);
    return exito(res, 201, favorito, 'Producto agregado a favoritos');
  } catch (err) {
    // 409: este usuario ya tenía ese producto en favoritos (índice UNIQUE)
    if (err.code === '23505') {
      throw new AppError(409, 'FAVORITO_DUPLICADO', 'El producto ya está en sus favoritos');
    }
    // El producto se eliminó justo entre la comprobación y el INSERT
    if (err.code === '23503' && err.constraint === 'fk_favoritos_producto') {
      throw new AppError(404, 'PRODUCTO_NO_ENCONTRADO', 'El producto no existe');
    }
    throw err;
  }
};

// DELETE /api/favoritos/:productoId  → 200
const quitarFavorito = async (req, res) => {
  const id = convertirId(req.params.productoId);
  if (!id) throw new AppError(400, 'ID_INVALIDO', 'El productoId debe ser un número entero positivo');

  // 404 si ESTE usuario no tiene ese favorito (aunque otro usuario sí lo tenga)
  if (!(await Favorito.quitar(req.usuario.id, id))) {
    throw new AppError(404, 'FAVORITO_NO_ENCONTRADO', 'El producto no está en sus favoritos');
  }
  return exito(res, 200, { producto_id: id }, 'Producto quitado de favoritos');
};

module.exports = { listarFavoritos, agregarFavorito, quitarFavorito };
