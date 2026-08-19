const locationRouter = require('express').Router();
const locationService = require('../services/locationService');

locationRouter.get('/', async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    ) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    const location = await locationService.getLocation(lon, lat);
    res.json(location);
  } catch (error) {
    next(error);
  }
});

module.exports = locationRouter;
