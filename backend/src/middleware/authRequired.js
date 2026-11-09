const crypto = require('node:crypto');
const sessionModel = require('../models/sessionModel');

function readCookie(request, name) {
  const cookieHeader = request.headers.cookie || '';
  for (const item of cookieHeader.split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0) continue;
    const key = item.slice(0, separator).trim();
    if (key === name) {
      return item.slice(separator + 1).trim();
    }
  }
  return null;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function authRequired(req, res, next) {
  const token = readCookie(req, 'dv_session');
  if (!token) {
    return res.status(401).json({ error: 'Debe iniciar sesión para acceder.' });
  }

  const user = sessionModel.buscarActiva(hashToken(token), new Date().toISOString());
  if (!user) {
    return res.status(401).json({ error: 'La sesión no es válida o expiró.' });
  }

  req.user = user;
  return next();
}

module.exports = { authRequired, hashToken, readCookie };
