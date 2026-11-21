require('dotenv').config();
const app = require('./app');

const PUERTO = Number(process.env.PORT) || 3000;

app.listen(PUERTO, (err) => {
  if (err) {
    const motivo = err.code === 'EADDRINUSE'
      ? `el puerto ${PUERTO} ya está en uso (¿hay otro servidor abierto?)`
      : err.message;
    console.error(`No se pudo iniciar el servidor: ${motivo}`);
    process.exit(1);
  }
  console.log(`Servidor escuchando en http://localhost:${PUERTO}/api`);
});