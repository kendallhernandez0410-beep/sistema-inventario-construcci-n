const db = require('../db/database');

function crear(usuarioId, tokenHash, expiraEn) {
  db.prepare(`
    INSERT INTO sesiones (usuario_id, token_hash, expira_en)
    VALUES (?, ?, ?)
  `).run(usuarioId, tokenHash, expiraEn);
}

function buscarActiva(tokenHash, ahora) {
  return db.prepare(`
    SELECT u.id, u.email, u.nombre, u.rol
    FROM sesiones s
    JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.token_hash = ? AND s.expira_en > ? AND u.activo = 1
  `).get(tokenHash, ahora);
}

function eliminarPorHash(tokenHash) {
  return db.prepare('DELETE FROM sesiones WHERE token_hash = ?').run(tokenHash);
}

module.exports = { crear, buscarActiva, eliminarPorHash };
