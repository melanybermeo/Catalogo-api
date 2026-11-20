// Funciones pequeñas de validación reutilizables (también las puede usar José).
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim().length > 0;
const esCorreoValido = (v) => typeof v === 'string' && REGEX_CORREO.test(v.trim());

module.exports = { esTextoNoVacio, esCorreoValido };
