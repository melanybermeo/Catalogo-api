// Acceso a datos de productos (José Farías).
// Todas las consultas son parametrizadas ($1, $2...) para evitar inyección SQL.
const { query } = require('../config/db');

const CAMPOS = 'id, nombre, descripcion, categoria, precio, creado_en, actualizado_en';

// Lista todo el catálogo o solo una categoría (sin distinguir mayúsculas).
const listar = async (categoria) => {
  if (categoria) {
    const { rows } = await query(
      `SELECT ${CAMPOS} FROM productos WHERE LOWER(categoria) = LOWER($1) ORDER BY id`,
      [categoria]
    );
    return rows;
  }
  const { rows } = await query(`SELECT ${CAMPOS} FROM productos ORDER BY id`);
  return rows;
};

const buscarPorId = async (id) => {
  const { rows } = await query(`SELECT ${CAMPOS} FROM productos WHERE id = $1`, [id]);
  return rows[0] || null;
};

const crear = async ({ nombre, descripcion, categoria, precio }) => {
  const { rows } = await query(
    `INSERT INTO productos (nombre, descripcion, categoria, precio)
     VALUES ($1, $2, $3, $4)
     RETURNING ${CAMPOS}`,
    [nombre, descripcion, categoria, precio]
  );
  return rows[0];
};

// Devuelve el producto actualizado, o null si no existe.
const actualizar = async (id, { nombre, descripcion, categoria, precio }) => {
  const { rows } = await query(
    `UPDATE productos
     SET nombre = $2, descripcion = $3, categoria = $4, precio = $5, actualizado_en = NOW()
     WHERE id = $1
     RETURNING ${CAMPOS}`,
    [id, nombre, descripcion, categoria, precio]
  );
  return rows[0] || null;
};

// Devuelve true si se eliminó. Sus favoritos se borran solos (ON DELETE CASCADE).
const eliminar = async (id) => {
  const { rowCount } = await query('DELETE FROM productos WHERE id = $1', [id]);
  return rowCount > 0;
};

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
