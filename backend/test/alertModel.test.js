const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const Database = require('better-sqlite3');
const alertaModel = require('../src/models/alertaModel');

function createDatabase() {
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8'));
  db.exec(fs.readFileSync(path.join(__dirname, '../src/db/seed.sql'), 'utf8'));
  db.prepare(`
    INSERT INTO alertas (tipo, material_id, mensaje)
    VALUES ('REORDEN', 1, 'Alerta abierta de prueba')
  `).run();
  db.prepare(`
    INSERT INTO alertas (tipo, material_id, mensaje, estado, cerrada_en)
    VALUES ('REORDEN', 2, 'Alerta cerrada de prueba', 'CERRADA', '2026-10-01T10:00:00.000Z')
  `).run();
  return db;
}

test('lists alerts by requested state and includes material details', () => {
  const db = createDatabase();
  try {
    const open = alertaModel.listarPorEstado('ABIERTA', db);
    const closed = alertaModel.listarPorEstado('CERRADA', db);

    assert.equal(open.length, 1);
    assert.equal(open[0].alerta_id, 1);
    assert.equal(open[0].material_nombre, 'Cemento gris 50 kg');
    assert.equal(closed.length, 1);
    assert.equal(closed[0].estado, 'CERRADA');
  } finally {
    db.close();
  }
});

test('closes an open alert once and does not change it a second time', () => {
  const db = createDatabase();
  try {
    const closedAt = '2026-11-09T19:00:00.000Z';
    const result = alertaModel.cerrarAbierta(1, closedAt, db);
    const secondResult = alertaModel.cerrarAbierta(1, '2026-11-09T20:00:00.000Z', db);
    const alert = db.prepare('SELECT estado, cerrada_en FROM alertas WHERE id = 1').get();

    assert.equal(result.changes, 1);
    assert.equal(secondResult.changes, 0);
    assert.equal(alert.estado, 'CERRADA');
    assert.equal(alert.cerrada_en, closedAt);
  } finally {
    db.close();
  }
});
