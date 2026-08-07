const winesRouter = require('express').Router();
const wineService = require('../services/wineService');

winesRouter.get('/', async (req, res, next) => {
  try {
    const { search, page } = req.query;
    const allWines = await wineService.getAllWines(search, page);
    res.json(allWines);
  } catch (error) {
    next(error);
  }
});

winesRouter.get('/:id', async (req, res, next) => {
  try {
    const wine = await wineService.getWineById(req.params.id);
    if (!wine) return res.status(404).json({ error: 'Wine not found' });
    res.json(wine);
  } catch (error) {
    next(error);
  }
});

module.exports = winesRouter;
