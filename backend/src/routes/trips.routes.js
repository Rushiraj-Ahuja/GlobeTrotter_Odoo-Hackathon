const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function normalizeNumeric(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function serializeTrip(row, tripStops = [], stopLookup = {}) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    start_date: row.start_date,
    end_date: row.end_date,
    description: row.description,
    cover_photo_url: row.cover_photo_url,
    share_token: row.share_token,
    created_at: row.created_at,
    updated_at: row.updated_at,
    trip_stops: tripStops,
  };
}

async function loadTripWithDetails(tripId, userId = null) {
  const tripQuery = userId
    ? 'SELECT * FROM trips WHERE id = ? AND user_id = ? LIMIT 1'
    : 'SELECT * FROM trips WHERE id = ? LIMIT 1';

  const [tripRows] = await pool.query(tripQuery, userId ? [tripId, userId] : [tripId]);
  if (!tripRows[0]) return null;

  const trip = tripRows[0];

  const [stopRows] = await pool.query(
    `SELECT ts.*, c.id AS city_id, c.name AS city_name, c.country AS city_country, c.region AS city_region, c.image_url AS city_image_url
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     WHERE ts.trip_id = ?
     ORDER BY ts.stop_order ASC, ts.start_date ASC, ts.id ASC`,
    [trip.id],
  );

  const stopIds = stopRows.map((stop) => stop.id);
  let stopActivities = [];

  if (stopIds.length > 0) {
    const placeholders = stopIds.map(() => '?').join(',');
    const [activityRows] = await pool.query(
      `SELECT sa.*, a.id AS activity_id, a.name AS activity_name, a.description AS activity_description,
              a.activity_type, a.cost, a.duration_minutes, a.image_url
       FROM stop_activities sa
       JOIN activities a ON a.id = sa.activity_id
       WHERE sa.stop_id IN (${placeholders})
       ORDER BY sa.id ASC`,
      stopIds,
    );

    stopActivities = activityRows;
  }

  const activityMap = new Map();
  for (const activity of stopActivities) {
    const key = activity.stop_id;
    if (!activityMap.has(key)) activityMap.set(key, []);
    activityMap.get(key).push({
      id: activity.id,
      stop_id: activity.stop_id,
      activity_id: activity.activity_id,
      activity_date: activity.activity_date,
      activity_time: activity.activity_time,
      custom_cost: activity.custom_cost,
      activity: {
        id: activity.activity_id,
        city_id: activity.activity_city_id,
        name: activity.activity_name,
        description: activity.activity_description,
        activity_type: activity.activity_type,
        cost: activity.cost,
        duration_minutes: activity.duration_minutes,
        image_url: activity.image_url,
      },
    });
  }

  const tripStops = stopRows.map((stop) => ({
    id: stop.id,
    trip_id: stop.trip_id,
    city_id: stop.city_id,
    city: {
      id: stop.city_id,
      name: stop.city_name,
      country: stop.city_country,
      region: stop.city_region,
      image_url: stop.city_image_url,
    },
    start_date: stop.start_date,
    end_date: stop.end_date,
    stop_order: stop.stop_order,
    transport_cost: stop.transport_cost,
    stay_cost: stop.stay_cost,
    meals_cost: stop.meals_cost,
    stop_activities: activityMap.get(stop.id) || [],
  }));

  return serializeTrip(trip, tripStops);
}

router.get('/trips', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*
       FROM trips t
       WHERE t.user_id = ?
       ORDER BY t.start_date DESC, t.created_at DESC`,
      [req.user.id],
    );

    const trips = [];
    for (const trip of rows) {
      const tripWithDetails = await loadTripWithDetails(trip.id, req.user.id);
      trips.push(tripWithDetails || serializeTrip(trip));
    }

    return res.json({ success: true, data: trips });
  } catch (error) {
    return next(error);
  }
});

router.get('/trips/:id', authenticate, async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID.' });
    }

    const trip = await loadTripWithDetails(tripId, req.user.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    return res.json({ success: true, data: trip });
  } catch (error) {
    return next(error);
  }
});

router.post('/trips', authenticate, async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const startDate = String(req.body?.start_date || '').trim();
    const endDate = String(req.body?.end_date || '').trim();
    const description = String(req.body?.description || '').trim();
    const coverPhotoUrl = String(req.body?.cover_photo_url || '').trim();

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Trip name, start date, and end date are required.',
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after the start date.',
      });
    }

    const shareToken = (() => {
      const base = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
      return base.slice(0, 80);
    })();

    const [result] = await pool.query(
      'INSERT INTO trips (user_id, name, start_date, end_date, description, cover_photo_url, share_token) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, startDate, endDate, description || null, coverPhotoUrl || null, shareToken],
    );

    const [tripRows] = await pool.query('SELECT * FROM trips WHERE id = ? LIMIT 1', [result.insertId]);

    if (!tripRows[0]) {
      return res.status(500).json({ success: false, message: 'Trip created but could not be loaded.' });
    }

    return res.status(201).json({
      success: true,
      data: serializeTrip(tripRows[0]),
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/trips/:id', authenticate, async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID.' });
    }

    const [existingRows] = await pool.query('SELECT * FROM trips WHERE id = ? AND user_id = ? LIMIT 1', [tripId, req.user.id]);
    if (!existingRows[0]) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const name = String(req.body?.name ?? existingRows[0].name).trim();
    const startDate = String(req.body?.start_date ?? existingRows[0].start_date).trim();
    const endDate = String(req.body?.end_date ?? existingRows[0].end_date).trim();
    const description = String(req.body?.description ?? existingRows[0].description ?? '').trim();
    const coverPhotoUrl = String(req.body?.cover_photo_url ?? existingRows[0].cover_photo_url ?? '').trim();

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Trip name, start date, and end date are required.' });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after the start date.' });
    }

    await pool.query(
      'UPDATE trips SET name = ?, start_date = ?, end_date = ?, description = ?, cover_photo_url = ? WHERE id = ? AND user_id = ?',
      [name, startDate, endDate, description || null, coverPhotoUrl || null, tripId, req.user.id],
    );

    const trip = await loadTripWithDetails(tripId, req.user.id);
    return res.json({ success: true, data: trip });
  } catch (error) {
    return next(error);
  }
});

router.delete('/trips/:id', authenticate, async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID.' });
    }

    const [result] = await pool.query('DELETE FROM trips WHERE id = ? AND user_id = ?', [tripId, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    return res.json({ success: true, data: { deleted: true, trip_id: tripId } });
  } catch (error) {
    return next(error);
  }
});

router.post('/trips/:tripId/stops', authenticate, async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);
    const cityId = Number(req.body?.city_id);
    const startDate = String(req.body?.start_date || '').trim();
    const endDate = String(req.body?.end_date || '').trim();
    const stopOrder = normalizeNumeric(req.body?.stop_order, 1);
    const transportCost = normalizeNumeric(req.body?.transport_cost, 0);
    const stayCost = normalizeNumeric(req.body?.stay_cost, 0);
    const mealsCost = normalizeNumeric(req.body?.meals_cost, 0);

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID.' });
    }

    if (!Number.isInteger(cityId) || cityId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid city selection is required.' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Stop start date and end date are required.' });
    }

    const [tripRows] = await pool.query('SELECT * FROM trips WHERE id = ? AND user_id = ? LIMIT 1', [tripId, req.user.id]);
    if (!tripRows[0]) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const [cityRows] = await pool.query('SELECT id FROM cities WHERE id = ? LIMIT 1', [cityId]);
    if (!cityRows[0]) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'Stop end date must be after the start date.' });
    }

    const [result] = await pool.query(
      'INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, stop_order, transport_cost, stay_cost, meals_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tripId, cityId, startDate, endDate, stopOrder, transportCost, stayCost, mealsCost],
    );

    const [rows] = await pool.query('SELECT * FROM trip_stops WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.delete('/stops/:stopId', authenticate, async (req, res, next) => {
  try {
    const stopId = Number(req.params.stopId);
    if (!Number.isInteger(stopId) || stopId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid stop ID.' });
    }

    const [rows] = await pool.query(
      `SELECT ts.id
       FROM trip_stops ts
       JOIN trips t ON t.id = ts.trip_id
       WHERE ts.id = ? AND t.user_id = ? LIMIT 1`,
      [stopId, req.user.id],
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Stop not found.' });
    }

    await pool.query('DELETE FROM trip_stops WHERE id = ?', [stopId]);
    return res.json({ success: true, data: { deleted: true, stop_id: stopId } });
  } catch (error) {
    return next(error);
  }
});

router.post('/stops/:stopId/activities', authenticate, async (req, res, next) => {
  try {
    const stopId = Number(req.params.stopId);
    const activityId = Number(req.body?.activity_id);
    const activityDate = String(req.body?.activity_date || '').trim();
    const activityTime = String(req.body?.activity_time || '09:00').trim();
    const customCost = req.body?.custom_cost !== undefined ? normalizeNumeric(req.body?.custom_cost, 0) : null;

    if (!Number.isInteger(stopId) || stopId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid stop ID.' });
    }

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid activity selection is required.' });
    }

    const [stopRows] = await pool.query(
      `SELECT ts.id FROM trip_stops ts
       JOIN trips t ON t.id = ts.trip_id
       WHERE ts.id = ? AND t.user_id = ? LIMIT 1`,
      [stopId, req.user.id],
    );

    if (!stopRows[0]) {
      return res.status(404).json({ success: false, message: 'Stop not found.' });
    }

    const [activityRows] = await pool.query('SELECT id FROM activities WHERE id = ? LIMIT 1', [activityId]);
    if (!activityRows[0]) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    const [result] = await pool.query(
      'INSERT INTO stop_activities (stop_id, activity_id, activity_date, activity_time, custom_cost) VALUES (?, ?, ?, ?, ?)',
      [stopId, activityId, activityDate || null, activityTime || '09:00', customCost],
    );

    const [rows] = await pool.query('SELECT * FROM stop_activities WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.delete('/activities/:activityRecordId', authenticate, async (req, res, next) => {
  try {
    const activityRecordId = Number(req.params.activityRecordId);
    if (!Number.isInteger(activityRecordId) || activityRecordId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid activity ID.' });
    }

    const [rows] = await pool.query(
      `SELECT sa.id
       FROM stop_activities sa
       JOIN trip_stops ts ON ts.id = sa.stop_id
       JOIN trips t ON t.id = ts.trip_id
       WHERE sa.id = ? AND t.user_id = ? LIMIT 1`,
      [activityRecordId, req.user.id],
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    await pool.query('DELETE FROM stop_activities WHERE id = ?', [activityRecordId]);
    return res.json({ success: true, data: { deleted: true, activity_id: activityRecordId } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
