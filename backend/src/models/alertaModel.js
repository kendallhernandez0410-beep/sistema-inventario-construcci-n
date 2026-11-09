const db = require('../db/database');

const ALERT_FIELDS = `
    a.id AS alerta_id, a.tipo, a.mensaje, a.estado, a.creada_en,
    a.cerrada_en, m.id AS material_id, m.sku,
    m.nombre AS material_nombre, m.stock_actual, m.demanda_promedio,
    m.demanda_maxima, m.plazo_entrega_dias
`;

function listarPorEstado(estado, database = db) {
  return database.prepare(`
    SELECT ${ALERT_FIELDS}
    FROM alertas a
    JOIN materiales m ON m.id = a.material_id
    WHERE a.estado = ?
    ORDER BY a.creada_en DESC, a.id DESC
  `).all(estado);
}

function listarReordenAbiertas(database = db) {
  return database.prepare(`
    SELECT ${ALERT_FIELDS}
    FROM alertas a
    JOIN materiales m ON m.id = a.material_id
    WHERE a.estado = 'ABIERTA' AND a.tipo = 'REORDEN'
    ORDER BY a.creada_en DESC, a.id DESC
  `).all();
}

function cerrarAbierta(id, fechaCierre, database = db) {
  return database.prepare(`
    UPDATE alertas
    SET estado = 'CERRADA', cerrada_en = ?
    WHERE id = ? AND estado = 'ABIERTA'
  `).run(fechaCierre, id);
}

module.exports = { listarPorEstado, listarReordenAbiertas, cerrarAbierta };
