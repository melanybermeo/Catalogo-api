// Tarea 15: formato JSON consistente para TODAS las respuestas.
//   Éxito: { "ok": true,  "mensaje": "...", "data": ... }
//   Error: { "ok": false, "error": { "codigo": "...", "mensaje": "...", "detalles": [...] } }

const exito = (res, estado, data, mensaje) => {
  const cuerpo = { ok: true };
  if (mensaje) cuerpo.mensaje = mensaje;
  if (data !== undefined) cuerpo.data = data;
  return res.status(estado).json(cuerpo);
};

const error = (res, estado, codigo, mensaje, detalles) => {
  const cuerpo = { ok: false, error: { codigo, mensaje } };
  if (detalles && detalles.length) cuerpo.error.detalles = detalles;
  return res.status(estado).json(cuerpo);
};

module.exports = { exito, error };
