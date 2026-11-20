// Acceso a datos de usuarios. Todas las consultas son parametrizadas ($1, $2...)
// para evitar inyección SQL. Ninguna función pública devuelve password_hash,
// excepto buscarPorCorreoConHash, que solo usa el login para comparar.
const { query } = require('../config/db');

const CAMPOS_PUBLICOS = 'id, nombre, correo, rol, creado_en';

const buscarPorCorreo = async (correo) => {
  const { rows } = await query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE correo = $1`, [correo]);
  return rows[0] || null;
};

const buscarPorCorreoConHash = async (correo) => {
  const { rows } = await query(
    `SELECT ${CAMPOS_PUBLICOS}, password_hash FROM usuarios WHERE correo = $1`,
    [correo]
  );
  return rows[0] || null;
};

const crear = async ({ nombre, correo, passwordHash, rol = 'usuario' }) => {
  const { rows } = await query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, correo, passwordHash, rol]
  );
  return rows[0];
};

const convertirEnAdmin = async (correo, passwordHash) => {
  const { rows } = await query(
    `UPDATE usuarios SET rol = 'admin', password_hash = $2
     WHERE correo = $1
     RETURNING ${CAMPOS_PUBLICOS}`,
    [correo, passwordHash]
  );
  return rows[0];
};

module.exports = { buscarPorCorreo, buscarPorCorreoConHash, crear, convertirEnAdmin };
