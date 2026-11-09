const crypto = require('node:crypto');
const sessionModel = require('../models/sessionModel');
const userModel = require('../models/userModel');
const { hashToken, readCookie } = require('../middleware/authRequired');
const { hashPassword, verifyPassword } = require('../services/password');

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const COOKIE_NAME = 'dv_session';
const DUMMY_PASSWORD_HASH = hashPassword(crypto.randomBytes(32).toString('hex'));

function cookieOptions() {
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Lax${secure}`;
}

function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || email.length > 254 || !password || password.length > 1024) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  const user = userModel.buscarActivoPorEmail(email);
  const passwordMatches = verifyPassword(
    password || '',
    user ? user.password_hash : DUMMY_PASSWORD_HASH
  );
  if (!user || !passwordMatches) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  sessionModel.crear(user.id, hashToken(token), expiresAt.toISOString());
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieOptions()}; Max-Age=${SESSION_DURATION_MS / 1000}`
  );
  return res.json({
    usuario: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
    expira_en: expiresAt.toISOString()
  });
}

function currentUser(req, res) {
  return res.json({ usuario: req.user });
}

function logout(req, res) {
  const token = readCookie(req, COOKIE_NAME);
  if (token) {
    sessionModel.eliminarPorHash(hashToken(token));
  }
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; ${cookieOptions()}; Max-Age=0`);
  return res.json({ mensaje: 'Sesión cerrada.' });
}

module.exports = { login, currentUser, logout };
