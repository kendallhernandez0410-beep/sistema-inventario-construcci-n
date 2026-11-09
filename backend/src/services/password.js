const crypto = require('node:crypto');

const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  const [algorithm, salt, keyHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !keyHex) {
    return false;
  }

  const expected = Buffer.from(keyHex, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

module.exports = { hashPassword, verifyPassword };
