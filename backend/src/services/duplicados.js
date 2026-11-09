const DIAS_CERCANIA = 7;
const TOLERANCIA_CANTIDAD = 0.1;

function detectarDuplicados(db) {
  return db.prepare(`
    SELECT
      o1.id AS orden_original_id,
      o1.numero_orden AS numero_orden_1,
      o2.id AS orden_duplicada_id,
      o2.numero_orden AS numero_orden_2,
      p.nombre AS proveedor,
      m.nombre AS material,
      o1.cantidad AS cantidad_1,
      o2.cantidad AS cantidad_2,
      o1.fecha_orden AS fecha_1,
      o2.fecha_orden AS fecha_2,
      CAST(ABS(julianday(o1.fecha_orden) - julianday(o2.fecha_orden)) AS INTEGER)
        AS dias_diferencia
    FROM ordenes_compra o1
    JOIN ordenes_compra o2
      ON o1.proveedor_id = o2.proveedor_id
      AND o1.material_id = o2.material_id
      AND o1.id < o2.id
    JOIN proveedores p ON p.id = o1.proveedor_id
    JOIN materiales m ON m.id = o1.material_id
    WHERE ABS(julianday(o1.fecha_orden) - julianday(o2.fecha_orden)) <= @diasCercania
      AND ABS(o1.cantidad - o2.cantidad) <= o1.cantidad * @toleranciaCantidad
      AND o1.estado != 'ANULADA'
      AND o2.estado != 'ANULADA'
    ORDER BY o1.fecha_orden, o1.id, o2.id
  `).all({
    diasCercania: DIAS_CERCANIA,
    toleranciaCantidad: TOLERANCIA_CANTIDAD
  });
}

module.exports = { detectarDuplicados, DIAS_CERCANIA, TOLERANCIA_CANTIDAD };
