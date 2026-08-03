const winesRouter = require('express').Router();
const winesService = require('../services/winesService');

winesRouter.get('/', async (req, res, next) => {
  try {
    const allWines = await winesService.getAllWines();
    res.json(allWines);
  } catch (error) {
    next(error);
  }
});

module.exports = winesRouter;
