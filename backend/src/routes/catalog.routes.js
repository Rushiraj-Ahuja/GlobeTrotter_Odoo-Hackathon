const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/cities', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM cities ORDER BY popularity DESC, name ASC',
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/activities', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM activities ORDER BY city_id ASC, name ASC',
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
