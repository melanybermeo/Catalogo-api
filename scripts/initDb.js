// Inicializa la base de datos: la crea si no existe y ejecuta, en orden,
// todos los archivos .sql de la carpeta db/ (01_usuarios, 02_productos, 03_favoritos...).
// Se puede ejecutar varias veces: las tablas usan CREATE ... IF NOT EXISTS.
// Uso: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const CARPETA_SQL = path.join(__dirname, '..', 'db');

const datosConexion = (database) => ({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database,
});

// Si la base indicada en DB_NAME no existe (código 3D000), se crea conectándose a "postgres".
const crearBaseSiNoExiste = async (nombre) => {
  const prueba = new Client(datosConexion(nombre));
  try {
    await prueba.connect();
    return false;
  } catch (err) {
    if (err.code !== '3D000') throw err;
  } finally {
    await prueba.end().catch(() => {});
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(nombre)) {
    throw new Error('DB_NAME solo puede tener letras, números y guion bajo');
  }
  const admin = new Client(datosConexion('postgres'));
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE "${nombre}"`);
  } finally {
    await admin.end();
  }
  return true;
};

(async () => {
  const nombreBase = process.env.DB_NAME;
  if (!process.env.DB_HOST || !process.env.DB_USER || !nombreBase) {
    console.error('Defina DB_HOST, DB_USER, DB_PASSWORD y DB_NAME en el .env');
    process.exitCode = 1;
    return;
  }

  let cliente;
  try {
    if (await crearBaseSiNoExiste(nombreBase)) {
      console.log(`Base de datos "${nombreBase}" creada.`);
    }

    cliente = new Client(datosConexion(nombreBase));
    await cliente.connect();

    const archivos = fs.readdirSync(CARPETA_SQL).filter((a) => a.endsWith('.sql')).sort();
    for (const archivo of archivos) {
      await cliente.query(fs.readFileSync(path.join(CARPETA_SQL, archivo), 'utf8'));
      console.log(`  ✓ ${archivo}`);
    }
    console.log(`Tablas listas en "${nombreBase}".`);
  } catch (err) {
    console.error('No se pudo inicializar la base de datos:', err.message);
    process.exitCode = 1;
  } finally {
    if (cliente) await cliente.end().catch(() => {});
  }
})();
