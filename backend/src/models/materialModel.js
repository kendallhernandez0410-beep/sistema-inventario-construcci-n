const db = require('../db/database');

function listarActivos() {
  return db.prepare(`
    SELECT * FROM materiales WHERE activo = 1 ORDER BY categoria, nombre
  `).all();
}

function buscarActivoPorId(id) {
  return db.prepare(`
    SELECT * FROM materiales WHERE id = ? AND activo = 1
  `).get(id);
}

function listarMovimientosRecientes(materialId) {
  return db.prepare(`
    SELECT id, tipo, cantidad, stock_resultante, fecha_movimiento,
           referencia, responsable, observaciones
    FROM movimientos WHERE material_id = ?
    ORDER BY fecha_movimiento DESC, id DESC LIMIT 50
  `).all(materialId);
}

module.exports = {
  listarActivos,
  buscarActivoPorId,
  listarMovimientosRecientes
};
