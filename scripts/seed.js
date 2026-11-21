// Tarea 11 · Datos de ejemplo: carga productos ficticios en el catálogo.
// Se puede ejecutar varias veces: un producto con el mismo nombre no se repite.
// Uso: npm run seed   (antes: npm run db:init)
require('dotenv').config();
const { pool, query } = require('../src/config/db');

const PRODUCTOS = [
  { nombre: 'Audífonos inalámbricos Zéfiro', descripcion: 'Audífonos Bluetooth con 20 horas de batería y estuche de carga.', categoria: 'electronica', precio: 39.9 },
  { nombre: 'Teclado mecánico Nébula', descripcion: 'Teclado compacto con switches rojos e iluminación blanca.', categoria: 'electronica', precio: 54.5 },
  { nombre: 'Botella térmica Andina 750 ml', descripcion: 'Botella de acero inoxidable que mantiene la bebida fría por 24 horas.', categoria: 'hogar', precio: 18.75 },
  { nombre: 'Lámpara de escritorio Faro', descripcion: 'Lámpara LED con tres tonos de luz y brazo ajustable.', categoria: 'hogar', precio: 24.99 },
  { nombre: 'Mochila urbana Cumbre', descripcion: 'Mochila impermeable con compartimento acolchado para laptop de 15".', categoria: 'accesorios', precio: 32 },
  { nombre: 'Cuaderno Origen tapa dura', descripcion: 'Cuaderno A5 de 160 hojas punteadas con tapa dura.', categoria: 'papeleria', precio: 6.5 },
];

(async () => {
  try {
    let insertados = 0;
    for (const p of PRODUCTOS) {
      // Inserta solo si todavía no existe un producto con ese nombre
      const { rowCount } = await query(
        `INSERT INTO productos (nombre, descripcion, categoria, precio)
         SELECT $1::varchar, $2::varchar, $3::varchar, $4::numeric
         WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = $1::varchar)`,
        [p.nombre, p.descripcion, p.categoria, p.precio]
      );
      insertados += rowCount;
    }
    const { rows } = await query('SELECT COUNT(*)::int AS total FROM productos');
    console.log(`Productos de ejemplo insertados: ${insertados}. Total en el catálogo: ${rows[0].total}.`);
  } catch (err) {
    console.error('No se pudieron cargar los productos de ejemplo:', err.message);
    if (err.code === '42P01') console.error('Primero ejecute: npm run db:init');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
