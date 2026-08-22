const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

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

router.get('/users/me', authenticate, async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: buildPublicUser(req.user),
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: buildPublicUser(req.user),
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/users/me', authenticate, async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const language = String(req.body?.language || req.user.language || 'English').trim();
    const photoUrl = String(req.body?.photo_url || req.user.photo_url || '').trim();

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (email !== req.user.email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1', [email, req.user.id]);
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This email address is already in use.',
        });
      }
    }

    const [updated] = await pool.query(
      'UPDATE users SET name = ?, email = ?, language = ?, photo_url = ? WHERE id = ?',
      [name, email, language || 'English', photoUrl || null, req.user.id],
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, photo_url, language, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id],
    );

    return res.json({
      success: true,
      data: buildPublicUser(rows[0]),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This email address is already in use.',
      });
    }

    return next(error);
  }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const language = String(req.body?.language || req.user.language || 'English').trim();
    const photoUrl = String(req.body?.photo_url || req.user.photo_url || '').trim();

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (email !== req.user.email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1', [email, req.user.id]);
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This email address is already in use.',
        });
      }
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, language = ?, photo_url = ? WHERE id = ?',
      [name, email, language || 'English', photoUrl || null, req.user.id],
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, photo_url, language, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id],
    );

    return res.json({
      success: true,
      data: buildPublicUser(rows[0]),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This email address is already in use.',
      });
    }

    return next(error);
  }
});

module.exports = router;
