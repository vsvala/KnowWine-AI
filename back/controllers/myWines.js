const router = require('express').Router();
const myWineService = require('../services/myWineService');
const authenticate = require('../utils/authenticate');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../utils/validate');

const createWineValidation = [
  body('name')
    .isString()
    .withMessage('name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('name must be 2–100 characters'),
  body('description')
    .isString()
    .withMessage('description must be a string')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('description must be 10–1000 characters'),
];
// // Input validation helpers
// const validateName = (name) => {
//   return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
// };
// const validateDescription = (desc) => {
//   return typeof desc === 'string' && desc.trim().length >= 10 && desc.trim().length <= 1000;
// };

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await myWineService.getAllMyWines(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const result = await myWineService.getMyWineById(id);
    if (!result) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (Number(result.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'not authorized' });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authenticate,
  createWineValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const newResult = await myWineService.createMyWine({
        name,
        description,
        userId: req.user.id,
      });
      res.status(201).json(newResult);
    } catch (error) {
      if (error.message === 'DUPLICATE_WINE_NAME') {
        return res.status(400).json({ error: 'wine name must be unique' });
      }
      next(error);
    }
  }
);

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const wine = await myWineService.getMyWineById(id);
    if (!wine) {
      return res.status(404).json({ error: 'wine not found' });
    }
    if (Number(wine.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'not authorized' });
    }
    await myWineService.deleteMyWineById(id);
    res.status(204).end();
  } catch (error) {
    if (error.message === 'WINE_NOT_FOUND') {
      return res.status(404).json({ error: 'wine not found' });
    }
    next(error);
  }
});

module.exports = router;
