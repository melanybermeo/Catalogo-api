const { Router } = require('express');
const { listarFavoritos, agregarFavorito, quitarFavorito } = require('../controllers/favoritos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

// Todas las rutas de favoritos requieren iniciar sesión (cualquier rol).
// verificarToken deja la identidad en req.usuario = { id, rol }.
router.use(verificarToken);

router.get('/', listarFavoritos);
router.post('/', agregarFavorito);
router.delete('/:productoId', quitarFavorito);

module.exports = router;
