function calcularReorden(material) {
  const stockSeguridad = (material.demanda_maxima - material.demanda_promedio) *
    material.plazo_entrega_dias;
  const puntoReorden = material.demanda_promedio * material.plazo_entrega_dias +
    stockSeguridad;

  return {
    stock_seguridad: stockSeguridad,
    punto_reorden: puntoReorden,
    requiere_reposicion: material.stock_actual <= puntoReorden,
    unidades_hasta_pr: Math.max(0, puntoReorden - material.stock_actual)
  };
}

function actualizarAlerta(db, material) {
  const calculo = calcularReorden(material);
  const alertaAbierta = db.prepare(`
    SELECT id FROM alertas
    WHERE material_id = ? AND tipo = 'REORDEN' AND estado = 'ABIERTA'
  `).get(material.id);

  if (calculo.requiere_reposicion && !alertaAbierta) {
    db.prepare(`
      INSERT INTO alertas (tipo, material_id, mensaje)
      VALUES ('REORDEN', ?, ?)
    `).run(
      material.id,
      `Stock ${material.stock_actual} ${material.unidad}; PR ${calculo.punto_reorden} ${material.unidad}.`
    );
  } else if (!calculo.requiere_reposicion && alertaAbierta) {
    db.prepare(`
      UPDATE alertas SET estado = 'CERRADA', cerrada_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(alertaAbierta.id);
  }

  return calculo;
}

function evaluarTodos(db) {
  const materiales = db.prepare('SELECT * FROM materiales WHERE activo = 1').all();
  return materiales.map((material) => ({
    ...material,
    ...actualizarAlerta(db, material)
  }));
}

module.exports = { calcularReorden, actualizarAlerta, evaluarTodos };
