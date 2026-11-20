// Tarea 21: crea (o promueve) el administrador desde la terminal.
// El rol admin NO se puede obtener desde /auth/registro; solo con este script.
// Uso: definir ADMIN_NOMBRE, ADMIN_CORREO y ADMIN_PASSWORD en el .env y ejecutar
//      npm run crear-admin
require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db');
const Usuario = require('../src/models/usuario.model');

(async () => {
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const correo = (process.env.ADMIN_CORREO || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!correo || password.length < 8) {
    console.error('Defina ADMIN_CORREO y ADMIN_PASSWORD (mín. 8 caracteres) en el .env');
    process.exitCode = 1;
    return pool.end();
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const existente = await Usuario.buscarPorCorreo(correo);

    if (existente) {
      await Usuario.convertirEnAdmin(correo, passwordHash);
      console.log(`El usuario ${correo} ya existía: ahora es admin.`);
    } else {
      await Usuario.crear({ nombre, correo, passwordHash, rol: 'admin' });
      console.log(`Administrador ${correo} creado.`);
    }
  } catch (err) {
    console.error('No se pudo crear el administrador:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
