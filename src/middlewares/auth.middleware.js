// Tarea 19: verifica firma y expiración del JWT.
// Si es válido, deja la identidad en req.usuario = { id, rol }.
// Las rutas de favoritos deben usar SIEMPRE req.usuario.id (nunca un id del body).
const jwt = require('jsonwebtoken');
const { secreto, algoritmo } = require('../config/jwt');
const AppError = require('../utils/AppError');

const verificarToken = (req, res, next) => {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new AppError(401, 'TOKEN_REQUERIDO', 'Debe enviar un token: Authorization: Bearer <token>'));
  }

  try {
    // jwt.verify comprueba la firma Y la fecha de vencimiento (exp)
    const payload = jwt.verify(token, secreto, { algorithms: [algoritmo] });
    req.usuario = { id: Number(payload.sub), rol: payload.rol };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'TOKEN_VENCIDO', 'El token ha vencido, inicie sesión nuevamente'));
    }
    return next(new AppError(401, 'TOKEN_INVALIDO', 'El token no es válido'));
  }
};

module.exports = { verificarToken };
