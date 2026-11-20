// Configuración del JWT tomada de variables de entorno (nunca en el código).
const secreto = process.env.JWT_SECRET;
const expiraEn = process.env.JWT_EXPIRES_IN || '1h';

if (!secreto || secreto.length < 32) {
  throw new Error('Falta JWT_SECRET en el .env (mínimo 32 caracteres).');
}

module.exports = { secreto, expiraEn, algoritmo: 'HS256' };
