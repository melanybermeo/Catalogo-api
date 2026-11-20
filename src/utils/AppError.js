// Tarea 15: error "controlado" que el middleware de errores convierte en JSON.
// Los controladores lanzan AppError en lugar de responder el error a mano.
class AppError extends Error {
  constructor(estado, codigo, mensaje, detalles) {
    super(mensaje);
    this.estado = estado;     // código HTTP (400, 401, 403, 404, 409, 422...)
    this.codigo = codigo;     // identificador corto, p. ej. 'CORREO_DUPLICADO'
    this.detalles = detalles; // opcional: lista de campos con problemas
  }
}

module.exports = AppError;
