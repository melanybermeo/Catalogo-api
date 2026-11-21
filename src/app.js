const express = require('express');
const authRoutes = require('./routes/auth.routes');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/error.middleware');

const app = express();
app.disable('x-powered-by'); // no revelar que usamos Express
app.use(express.json());
app.use(express.static('public')); // página web opcional en http://localhost:3000

app.get('/api', (req, res) => res.json({ ok: true, mensaje: 'API Catálogo funcionando' }));

app.use('/api/auth', authRoutes);
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/favoritos', require('./routes/favoritos.routes'));

// Estas dos SIEMPRE van al final
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
