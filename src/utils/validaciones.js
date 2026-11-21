// Funciones pequeñas de validación reutilizables (también las puede usar José).
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim().length > 0;
const esCorreoValido = (v) => typeof v === 'string' && REGEX_CORREO.test(v.trim());

// José · ids de PostgreSQL (SERIAL = INTEGER): enteros positivos hasta 2147483647.
// Acepta 5 o "5". Devuelve el número, o null si no es un id válido ("abc", 1.5, -3, 0...).
const MAX_ID = 2147483647;
const convertirId = (v) => {
  if (typeof v !== 'number' && typeof v !== 'string') return null;
  const texto = String(v).trim();
  if (!/^\d+$/.test(texto)) return null;
  const id = Number(texto);
  return id >= 1 && id <= MAX_ID ? id : null;
};

module.exports = { esTextoNoVacio, esCorreoValido, convertirId };
