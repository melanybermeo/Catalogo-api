// Tarea 6 · Conexión a PostgreSQL usando variables de entorno (nunca datos en el código).
// Exporta:
//   - query(texto, parametros): ejecuta una consulta parametrizada ($1, $2...)
//   - pool: el grupo de conexiones (los scripts lo cierran con pool.end())
const { Pool, types } = require('pg');

// PostgreSQL devuelve NUMERIC (el precio) como texto, p. ej. "39.90".
// Con esto llega a JavaScript como número: 39.9
types.setTypeParser(types.builtins.NUMERIC, (valor) => (valor === null ? null : parseFloat(valor)));

const faltantes = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter((v) => !process.env[v]);
if (faltantes.length) {
  throw new Error(`Faltan variables de la base de datos en el .env: ${faltantes.join(', ')}`);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
});

// Si una conexión inactiva falla, se registra sin tumbar el servidor.
pool.on('error', (err) => console.error('[DB] Error inesperado en la conexión:', err.message));

const query = (texto, parametros) => pool.query(texto, parametros);

module.exports = { pool, query };
