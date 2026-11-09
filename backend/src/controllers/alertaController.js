const alertaModel = require('../models/alertaModel');

const ESTADOS_VALIDOS = new Set(['ABIERTA', 'CERRADA']);

function listar(req, res) {
  const estado = typeof req.query.estado === 'string'
    ? req.query.estado.toUpperCase()
    : 'ABIERTA';
  if (!ESTADOS_VALIDOS.has(estado)) {
    return res.status(400).json({
      success: false,
      message: 'El estado debe ser ABIERTA o CERRADA.'
    });
  }

  const data = alertaModel.listarPorEstado(estado);
  return res.json({
    success: true,
    total: data.length,
    estado_consultado: estado,
    data
  });
}

function listarReorden(req, res) {
  return res.json({ datos: alertaModel.listarReordenAbiertas() });
}

function cerrar(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: 'El id de alerta debe ser un entero positivo.'
    });
  }

  const fechaCierre = new Date().toISOString();
  const resultado = alertaModel.cerrarAbierta(id, fechaCierre);
  if (resultado.changes === 0) {
    return res.status(404).json({
      success: false,
      message: 'Alerta no encontrada o ya se encontraba cerrada'
    });
  }

  return res.json({
    success: true,
    message: `Alerta #${id} cerrada correctamente`,
    cerrada_en: fechaCierre
  });
}

module.exports = { listar, listarReorden, cerrar };
