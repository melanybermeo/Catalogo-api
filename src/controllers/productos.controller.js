// Tareas 12, 13 y 14 · CRUD de productos con validaciones (José Farías).
// Los errores se lanzan con AppError y el middleware de errores los convierte en JSON.
const Producto = require('../models/producto.model');
const AppError = require('../utils/AppError');
const { exito } = require('../utils/respuesta');
const { esTextoNoVacio, convertirId } = require('../utils/validaciones');

const PRECIO_MAXIMO = 99999999.99; // límite de NUMERIC(10,2)
const LIMITES = { nombre: 120, descripcion: 500, categoria: 60 };

// 400 si el id de la URL no es un entero positivo (p. ej. /productos/abc)
const leerId = (valor) => {
  const id = convertirId(valor);
  if (!id) throw new AppError(400, 'ID_INVALIDO', 'El id debe ser un número entero positivo');
  return id;
};

// Valida el cuerpo de POST y PUT. Devuelve los datos limpios (sin espacios sobrantes).
const validarProducto = (body) => {
  const { nombre, descripcion, categoria, precio } = body || {};

  // 400: faltan campos obligatorios o llegaron vacíos
  const faltantes = [];
  if (!esTextoNoVacio(nombre)) faltantes.push('nombre');
  if (!esTextoNoVacio(descripcion)) faltantes.push('descripcion');
  if (!esTextoNoVacio(categoria)) faltantes.push('categoria');
  if (precio === undefined || precio === null || precio === '') faltantes.push('precio');
  if (faltantes.length) {
    throw new AppError(400, 'CAMPOS_OBLIGATORIOS', 'Faltan campos obligatorios', faltantes);
  }

  // 422: llegaron todos, pero algún valor no cumple las reglas
  const invalidos = [];
  if (typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0) {
    invalidos.push('precio: debe ser un número mayor que 0');
  } else if (precio > PRECIO_MAXIMO) {
    invalidos.push(`precio: máximo ${PRECIO_MAXIMO}`);
  } else if (Number(precio.toFixed(2)) !== precio) {
    invalidos.push('precio: máximo 2 decimales');
  }
  for (const [campo, maximo] of Object.entries(LIMITES)) {
    if (body[campo].trim().length > maximo) invalidos.push(`${campo}: máximo ${maximo} caracteres`);
  }
  if (invalidos.length) {
    throw new AppError(422, 'DATOS_INVALIDOS', 'Hay datos con formato inválido', invalidos);
  }

  return {
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    categoria: categoria.trim(),
    precio,
  };
};

// GET /api/productos  y  GET /api/productos?categoria=hogar  → 200 (público)
const listarProductos = async (req, res) => {
  const { categoria } = req.query;
  if (categoria !== undefined && typeof categoria !== 'string') {
    throw new AppError(400, 'FILTRO_INVALIDO', 'Envíe una sola categoría: ?categoria=nombre');
  }
  const productos = await Producto.listar(categoria ? categoria.trim() : undefined);
  return exito(res, 200, productos);
};

// GET /api/productos/:id  → 200 (público)
const obtenerProducto = async (req, res) => {
  const producto = await Producto.buscarPorId(leerId(req.params.id));
  if (!producto) throw new AppError(404, 'PRODUCTO_NO_ENCONTRADO', 'El producto no existe');
  return exito(res, 200, producto);
};

// POST /api/productos  → 201 (solo admin)
const crearProducto = async (req, res) => {
  const producto = await Producto.crear(validarProducto(req.body));
  return exito(res, 201, producto, 'Producto creado correctamente');
};

// PUT /api/productos/:id  → 200 (solo admin). Reemplaza los cuatro campos.
const actualizarProducto = async (req, res) => {
  const id = leerId(req.params.id);
  const producto = await Producto.actualizar(id, validarProducto(req.body));
  if (!producto) throw new AppError(404, 'PRODUCTO_NO_ENCONTRADO', 'El producto no existe');
  return exito(res, 200, producto, 'Producto actualizado correctamente');
};

// DELETE /api/productos/:id  → 200 (solo admin). Sus favoritos se borran en cascada.
const eliminarProducto = async (req, res) => {
  const id = leerId(req.params.id);
  if (!(await Producto.eliminar(id))) {
    throw new AppError(404, 'PRODUCTO_NO_ENCONTRADO', 'El producto no existe');
  }
  return exito(res, 200, { id }, 'Producto eliminado correctamente');
};

module.exports = { listarProductos, obtenerProducto, crearProducto, actualizarProducto, eliminarProducto };
