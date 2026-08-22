const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function buildPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photo_url: user.photo_url || null,
    language: user.language || 'English',
    created_at: user.created_at,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

router.post('/auth/signup', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, photo_url, language) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, null, 'English'],
    );

    const [userRows] = await pool.query(
      'SELECT id, name, email, photo_url, language, created_at FROM users WHERE id = ?',
      [result.insertId],
    );

    const user = userRows[0];
    const token = signToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: buildPublicUser(user),
      },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    return next(error);
  }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, photo_url, language, created_at FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      data: {
        token,
        user: buildPublicUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/auth/me', authenticate, async (req, res) => {
  return res.json({
    success: true,
    data: buildPublicUser(req.user),
  });
});

module.exports = router;
