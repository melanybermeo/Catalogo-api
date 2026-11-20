// Tarea 20: control de rol. Se usa DESPUÉS de verificarToken.
// Ejemplo (Tarea 22, José):
//   router.post('/', verificarToken, permitirRoles('admin'), crearProducto);
const AppError = require('../utils/AppError');

const permitirRoles = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) {
    return next(new AppError(401, 'TOKEN_REQUERIDO', 'Debe iniciar sesión'));
  }
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return next(new AppError(403, 'ACCESO_DENEGADO', 'No tiene permisos para realizar esta acción'));
  }
  return next();
};

module.exports = { permitirRoles };
