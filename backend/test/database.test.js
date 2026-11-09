const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const Database = require('better-sqlite3');

test('database schema creates inventory and authentication tables', () => {
  const db = new Database(':memory:');
  const schema = fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8');
  db.exec(schema);

  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type = 'table'
  `).all().map((row) => row.name);

  for (const table of [
    'usuarios',
    'sesiones',
    'materiales',
    'proveedores',
    'ordenes_compra',
    'movimientos',
    'alertas'
  ]) {
    assert.ok(tables.includes(table), `Expected table ${table}`);
  }
  db.close();
});
