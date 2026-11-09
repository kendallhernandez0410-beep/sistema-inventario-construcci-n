const db = require('../db/database');
const { detectarDuplicados } = require('../services/duplicados');

function listarPosiblesDuplicados() {
  return detectarDuplicados(db);
}

module.exports = {
  listarPosiblesDuplicados,
  CriterioDuplicados: 'Mismo proveedor, mismo material, cantidad similar (±10%) y fecha cercana (<= 7 días)'
};
