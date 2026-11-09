const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const dotenv = require('dotenv');
const { hashPassword } = require('../services/password');

dotenv.config();

const configuredPath = process.env.DB_PATH || './data/inventario.sqlite';
const databasePath = path.resolve(process.cwd(), configuredPath);
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

const materialCount = db.prepare('SELECT COUNT(*) AS total FROM materiales').get().total;
if (materialCount === 0) {
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  db.transaction(() => db.exec(seed))();
}

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@delvalle.local').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'DelValleDemo2026!';
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || adminEmail.length > 254) {
  throw new Error('ADMIN_EMAIL debe ser una dirección de correo válida.');
}
if (adminPassword.length < 12) {
  throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres.');
}

const existingAdmin = db.prepare(`
  SELECT id FROM usuarios WHERE email = ? COLLATE NOCASE
`).get(adminEmail);
if (!existingAdmin) {
  db.prepare(`
    INSERT INTO usuarios (email, nombre, password_hash, rol)
    VALUES (?, ?, ?, 'administrador')
  `).run(adminEmail, 'Administrador Del Valle', hashPassword(adminPassword));
}
db.prepare('DELETE FROM sesiones WHERE expira_en <= ?').run(new Date().toISOString());

module.exports = db;
