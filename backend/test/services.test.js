const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const Database = require('better-sqlite3');
const { calcularReorden } = require('../src/services/reorden');
const { detectarDuplicados } = require('../src/services/duplicados');

test('calcula el stock de seguridad y punto de reorden del cemento', () => {
  const result = calcularReorden({
    demanda_promedio: 20,
    demanda_maxima: 28,
    plazo_entrega_dias: 5,
    stock_actual: 115
  });

  assert.equal(result.stock_seguridad, 40);
  assert.equal(result.punto_reorden, 140);
  assert.equal(result.requiere_reposicion, true);
  assert.equal(result.unidades_hasta_pr, 25);
});

test('detecta solo los dos pares sembrados bajo la regla de duplicidad', () => {
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8'));
  db.exec(fs.readFileSync(path.join(__dirname, '../src/db/seed.sql'), 'utf8'));

  const duplicates = detectarDuplicados(db);
  const orderPairs = duplicates.map((pair) => [
    pair.numero_orden_1,
    pair.numero_orden_2
  ]);

  assert.deepEqual(orderPairs, [
    ['OC-2026-1001', 'OC-2026-1002'],
    ['OC-2026-1005', 'OC-2026-1006']
  ]);
  assert.ok(duplicates.every((pair) => pair.dias_diferencia === 2));
  db.close();
});

test('allows quantities within 10 percent and dates exactly seven days apart', () => {
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8'));
  db.exec(fs.readFileSync(path.join(__dirname, '../src/db/seed.sql'), 'utf8'));
  db.prepare(`
    INSERT INTO ordenes_compra
      (numero_orden, proveedor_id, material_id, cantidad, precio_unitario, fecha_orden, estado)
    VALUES (?, 1, 1, ?, 6300, ?, ?)
  `).run('OC-TEST-100', 100, '2026-11-01', 'RECIBIDA');
  db.prepare(`
    INSERT INTO ordenes_compra
      (numero_orden, proveedor_id, material_id, cantidad, precio_unitario, fecha_orden, estado)
    VALUES (?, 1, 1, ?, 6300, ?, ?)
  `).run('OC-TEST-110', 110, '2026-11-08', 'RECIBIDA');

  const duplicates = detectarDuplicados(db);
  const match = duplicates.find((pair) =>
    pair.numero_orden_1 === 'OC-TEST-100' &&
    pair.numero_orden_2 === 'OC-TEST-110'
  );
  assert.ok(match);
  assert.equal(match.dias_diferencia, 7);
  assert.equal(match.cantidad_1, 100);
  assert.equal(match.cantidad_2, 110);
  db.close();
});

test('excludes orders outside quantity/date thresholds and canceled orders', () => {
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8'));
  db.exec(fs.readFileSync(path.join(__dirname, '../src/db/seed.sql'), 'utf8'));
  const insertOrder = db.prepare(`
    INSERT INTO ordenes_compra
      (numero_orden, proveedor_id, material_id, cantidad, precio_unitario, fecha_orden, estado)
    VALUES (?, 1, 1, ?, 6300, ?, ?)
  `);
  insertOrder.run('OC-TEST-BASE', 100, '2026-11-01', 'RECIBIDA');
  insertOrder.run('OC-TEST-OVER-QTY', 111, '2026-11-02', 'RECIBIDA');
  insertOrder.run('OC-TEST-OVER-DATE', 100, '2026-11-10', 'RECIBIDA');
  insertOrder.run('OC-TEST-CANCELED', 100, '2026-11-02', 'ANULADA');

  const duplicates = detectarDuplicados(db).filter((pair) =>
    pair.numero_orden_1.startsWith('OC-TEST-') &&
    pair.numero_orden_2.startsWith('OC-TEST-')
  );
  assert.deepEqual(duplicates, []);
  db.close();
});
