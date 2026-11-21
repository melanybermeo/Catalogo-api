// Acceso a datos de favoritos (José Farías).
// TODAS las funciones reciben el usuarioId que viene del token (req.usuario.id),
// y TODAS las consultas filtran por ese usuario: así nadie toca favoritos ajenos.
const { query } = require('../config/db');

const CAMPOS_PRODUCTO = 'p.nombre, p.descripcion, p.categoria, p.precio';

// Favoritos del usuario, con los datos de cada producto (el más reciente primero).
const listarPorUsuario = async (usuarioId) => {
  const { rows } = await query(
    `SELECT f.producto_id, ${CAMPOS_PRODUCTO}, f.creado_en AS agregado_en
     FROM favoritos f
     JOIN productos p ON p.id = f.producto_id
     WHERE f.usuario_id = $1
     ORDER BY f.creado_en DESC, f.id DESC`,
    [usuarioId]
  );
  return rows;
};

// Inserta el favorito y lo devuelve junto con los datos del producto.
// Si ya existe, PostgreSQL lanza el error 23505 (índice UNIQUE).
const agregar = async (usuarioId, productoId) => {
  const { rows } = await query(
    `WITH nuevo AS (
       INSERT INTO favoritos (usuario_id, producto_id)
       VALUES ($1, $2)
       RETURNING producto_id, creado_en
     )
     SELECT n.producto_id, ${CAMPOS_PRODUCTO}, n.creado_en AS agregado_en
     FROM nuevo n
     JOIN productos p ON p.id = n.producto_id`,
    [usuarioId, productoId]
  );
  return rows[0];
};

// Devuelve true si se quitó. El WHERE incluye usuario_id: el favorito de otro usuario no se toca.
const quitar = async (usuarioId, productoId) => {
  const { rowCount } = await query(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
    [usuarioId, productoId]
  );
  return rowCount > 0;
};

module.exports = { listarPorUsuario, agregar, quitar };
