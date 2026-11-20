// Apoyo para la prueba "token vencido → 401" (Tarea 29).
// Genera un token firmado con el JWT_SECRET local pero que venció hace 1 hora.
// Uso: npm run token-vencido  → copiar el resultado en la variable "tokenVencido"
//      de Postman (solo en "Current value", nunca exportarlo).
require('dotenv').config();
const jwt = require('jsonwebtoken');

const haceUnaHora = Math.floor(Date.now() / 1000) - 3600;
const token = jwt.sign(
  { sub: '999', rol: 'usuario', iat: haceUnaHora - 60, exp: haceUnaHora },
  process.env.JWT_SECRET,
  { algorithm: 'HS256' }
);
console.log(token);
