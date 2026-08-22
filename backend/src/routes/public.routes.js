const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

async function loadTripPublicDetails(tripId) {
  const [tripRows] = await pool.query('SELECT * FROM trips WHERE id = ? LIMIT 1', [tripId]);
  if (!tripRows[0]) return null;

  const trip = tripRows[0];
  const [stopRows] = await pool.query(
    `SELECT ts.*, c.id AS city_id, c.name AS city_name, c.country AS city_country, c.region AS city_region
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     WHERE ts.trip_id = ?
     ORDER BY ts.stop_order ASC, ts.start_date ASC`,
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
        name: activity.activity_name,
        description: activity.activity_description,
        activity_type: activity.activity_type,
        cost: activity.cost,
        duration_minutes: activity.duration_minutes,
        image_url: activity.image_url,
      },
    });
  }

  return {
    id: trip.id,
    user_id: trip.user_id,
    name: trip.name,
    start_date: trip.start_date,
    end_date: trip.end_date,
    description: trip.description,
    cover_photo_url: trip.cover_photo_url,
    share_token: trip.share_token,
    trip_stops: stopRows.map((stop) => ({
      id: stop.id,
      trip_id: stop.trip_id,
      city_id: stop.city_id,
      city: {
        id: stop.city_id,
        name: stop.city_name,
        country: stop.city_country,
        region: stop.city_region,
      },
      start_date: stop.start_date,
      end_date: stop.end_date,
      stop_order: stop.stop_order,
      stop_activities: activityMap.get(stop.id) || [],
    })),
  };
}

router.get('/public/trips', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE share_token IS NOT NULL AND share_token != ? ORDER BY created_at DESC LIMIT 50',
      [''],
    );

    const trips = [];
    for (const row of rows) {
      const publicTrip = await loadTripPublicDetails(row.id);
      if (publicTrip) trips.push(publicTrip);
    }

    return res.json({ success: true, data: trips });
  } catch (error) {
    return next(error);
  }
});

router.get('/public/trips/:token', async (req, res, next) => {
  try {
    const token = String(req.params.token || '').trim();
    if (!token) {
      return res.status(400).json({ success: false, message: 'Public trip token is required.' });
    }

    const [rows] = await pool.query('SELECT * FROM trips WHERE share_token = ? LIMIT 1', [token]);
    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Public trip not found.' });
    }

    const trip = await loadTripPublicDetails(rows[0].id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Public trip not found.' });
    }

    return res.json({ success: true, data: trip });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
