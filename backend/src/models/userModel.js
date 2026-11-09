const db = require('../db/database');

function buscarActivoPorEmail(email) {
  return db.prepare(`
    SELECT id, email, nombre, password_hash, rol
    FROM usuarios
    WHERE email = ? COLLATE NOCASE AND activo = 1
  `).get(email);
}

function buscarPublicoPorId(id) {
  return db.prepare(`
    SELECT id, email, nombre, rol
    FROM usuarios
    WHERE id = ? AND activo = 1
  `).get(id);
}

module.exports = { buscarActivoPorEmail, buscarPublicoPorId };
