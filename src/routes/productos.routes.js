const { Router } = require('express');
const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/productos.controller');

const router = Router();

// Catálogo público: no necesita token
router.get('/', listarProductos);
router.get('/:id', obtenerProducto);

// Tarea 13 · CRUD todavía SIN protección (se protege en la Tarea 22)
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
