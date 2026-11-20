const { Router } = require('express');
const { registrar, iniciarSesion } = require('../controllers/auth.controller');

const router = Router();

router.post('/registro', registrar); // Público
router.post('/login', iniciarSesion); // Público

module.exports = router;
