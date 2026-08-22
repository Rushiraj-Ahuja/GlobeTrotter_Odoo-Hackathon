const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter-secret-dev';

function getTokenFromRequest(req) {
  const header = req.headers.authorization || req.headers.Authorization;

  if (!header) {
    return null;
  }

  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  return header.trim();
}

async function authenticate(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, photo_url, language, created_at FROM users WHERE id = ?',
      [decoded.id],
    );

    if (!rows[0]) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    req.user = rows[0];
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

module.exports = { authenticate, JWT_SECRET };
