const assert = require('node:assert/strict');
const test = require('node:test');
const { hashPassword, verifyPassword } = require('../src/services/password');

test('password hashes verify only the original password', () => {
  const password = 'UnaClaveDePrueba!2026';
  const storedHash = hashPassword(password);

  assert.notEqual(storedHash, password);
  assert.equal(verifyPassword(password, storedHash), true);
  assert.equal(verifyPassword('otra-clave', storedHash), false);
});
