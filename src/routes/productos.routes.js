const { Router } = require('express');
const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/productos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/rol.middleware');

const router = Router();

// Catálogo público: no necesita token
router.get('/', listarProductos);
router.get('/:id', obtenerProducto);

// Tarea 22 · Solo el administrador modifica el catálogo.
// Orden: 1) verificarToken (401 sin token / vencido)  2) permitirRoles (403 si no es admin)
const soloAdmin = [verificarToken, permitirRoles('admin')];

router.post('/', soloAdmin, crearProducto);
router.put('/:id', soloAdmin, actualizarProducto);
router.delete('/:id', soloAdmin, eliminarProducto);

module.exports = router;
