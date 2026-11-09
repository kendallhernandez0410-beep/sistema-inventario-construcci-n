const db = require('../db/database');
const { actualizarAlerta } = require('../services/reorden');

function crearConActualizacionDeStock({
  materialId,
  tipo,
  cantidad,
  fechaMovimiento,
  referencia,
  responsable,
  observaciones
}) {
  return db.transaction(() => {
    const material = db.prepare(`
      SELECT * FROM materiales WHERE id = ? AND activo = 1
    `).get(materialId);
    if (!material) {
      const error = new Error('Material no encontrado.');
      error.status = 404;
      throw error;
    }

    const nuevoStock = tipo === 'ENTRADA'
      ? material.stock_actual + cantidad
      : material.stock_actual - cantidad;
    if (nuevoStock < 0) {
      const error = new Error('La salida excede el stock disponible.');
      error.status = 400;
      throw error;
    }

    db.prepare('UPDATE materiales SET stock_actual = ? WHERE id = ?')
      .run(nuevoStock, materialId);
    const movimiento = db.prepare(`
      INSERT INTO movimientos
        (material_id, tipo, cantidad, stock_resultante, fecha_movimiento,
         referencia, responsable, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      materialId,
      tipo,
      cantidad,
      nuevoStock,
      fechaMovimiento,
      referencia,
      responsable,
      observaciones
    );

    const actualizado = { ...material, stock_actual: nuevoStock };
    return {
      movimiento_id: Number(movimiento.lastInsertRowid),
      stock_anterior: material.stock_actual,
      material: actualizado,
      calculo: actualizarAlerta(db, actualizado)
    };
  })();
}

module.exports = { crearConActualizacionDeStock };
