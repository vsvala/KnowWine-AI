const winesRouter = require('express').Router();
const wineService = require('../services/wineService');

winesRouter.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const allWines = await wineService.getAllWines(search);
    res.json(allWines);
  } catch (error) {
    next(error);
  }
});

module.exports = winesRouter;
