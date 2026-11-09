const path = require('node:path');
const express = require('express');
const db = require('./db/database');
const { evaluarTodos } = require('./services/reorden');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'inventario-constructora-del-valle' });
});
app.use('/api/auth', require('./routes/auth'));
const { authRequired } = require('./middleware/authRequired');
app.use('/api', authRequired);
app.use('/api/materiales', require('./routes/materiales'));
app.use('/api/movimientos', require('./routes/movimientos'));
app.use('/api/alertas', require('./routes/alertas'));
app.use('/api/ordenes', require('./routes/ordenes'));
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({ error: 'Error interno del servidor.' });
});

evaluarTodos(db);
const server = app.listen(port, () => {
  console.log(`Inventario disponible en http://localhost:${port}`);
});

function cerrarServidor() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', cerrarServidor);
process.on('SIGTERM', cerrarServidor);

module.exports = app;
