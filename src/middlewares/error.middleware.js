// Tarea 15: manejo centralizado de errores sin exponer detalles internos.
const AppError = require('../utils/AppError');
const { error } = require('../utils/respuesta');

// Ruta que no existe → 404 con el mismo formato JSON.
const rutaNoEncontrada = (req, res) =>
  error(res, 404, 'RUTA_NO_ENCONTRADA', `No existe la ruta ${req.method} ${req.originalUrl}`);

// eslint-disable-next-line no-unused-vars
const manejadorErrores = (err, req, res, next) => {
  // 1) Errores lanzados a propósito desde controladores/middlewares
  if (err instanceof AppError) {
    return error(res, err.estado, err.codigo, err.message, err.detalles);
  }

  // 2) JSON mal escrito en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return error(res, 400, 'JSON_INVALIDO', 'El cuerpo de la petición no es un JSON válido');
  }

  // 3) Errores conocidos de PostgreSQL (por si alguna validación se escapa)
  if (err.code === '23505') {
    return error(res, 409, 'REGISTRO_DUPLICADO', 'El registro ya existe');
  }
  if (err.code === '23503') {
    return error(res, 404, 'REFERENCIA_INEXISTENTE', 'El recurso relacionado no existe');
  }
  if (err.code === '22P02') {
    return error(res, 400, 'FORMATO_INVALIDO', 'Algún valor tiene un formato inválido');
  }

  // 4) Cualquier otra cosa: se registra en consola, pero al cliente
  //    solo se le dice "error interno" (sin stack, sin SQL, sin secretos).
  console.error('[ERROR]', err);
  return error(res, 500, 'ERROR_INTERNO', 'Ocurrió un error interno en el servidor');
};

module.exports = { rutaNoEncontrada, manejadorErrores };
