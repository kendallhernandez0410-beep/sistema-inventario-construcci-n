const ordenModel = require('../models/ordenModel');

function listarPosiblesDuplicados(req, res) {
  const data = ordenModel.listarPosiblesDuplicados();
  return res.json({
    success: true,
    total_encontrados: data.length,
    criterio: ordenModel.CriterioDuplicados,
    data
  });
}

module.exports = { listarPosiblesDuplicados };
