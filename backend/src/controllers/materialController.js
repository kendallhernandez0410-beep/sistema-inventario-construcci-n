const materialModel = require('../models/materialModel');
const { calcularReorden } = require('../services/reorden');

function listar(req, res) {
  const materiales = materialModel.listarActivos()
    .map((material) => {
      const calculo = calcularReorden({
        ...material,
        demanda_promedio: Number(material.demanda_promedio),
        demanda_maxima: Number(material.demanda_maxima),
        plazo_entrega_dias: Number(material.plazo_entrega_dias),
        stock_actual: Number(material.stock_actual)
      });
      return {
        ...material,
        stock_seguridad: calculo.stock_seguridad,
        punto_reorden: calculo.punto_reorden,
        alerta_reorden: calculo.requiere_reposicion,
        requiere_reposicion: calculo.requiere_reposicion,
        unidades_hasta_pr: calculo.unidades_hasta_pr
      };
    });
  return res.json({ success: true, data: materiales });
}

function consultarStock(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  const material = materialModel.buscarActivoPorId(id);
  if (!material) {
    return res.status(404).json({ error: 'Material no encontrado.' });
  }

  return res.json({
    material: { ...material, ...calcularReorden(material) },
    movimientos: materialModel.listarMovimientosRecientes(id)
  });
}

module.exports = { listar, consultarStock };
