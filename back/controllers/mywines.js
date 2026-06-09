const router = require('express').Router();
const mywineModel = require('../models/mywine');

// Input validation helpers
const validateName = (name) => {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
};

const validateDescription = (desc) => {
  return typeof desc === 'string' && desc.trim().length >= 10 && desc.trim().length <= 1000;
};

router.get('/', async (req, res, next) => {
  try {
    const result = await mywineModel.getAll();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const result = await mywineModel.getById(id);
    if (!result) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({ error: 'name must be 2–100 characters' });
    }
    if (!validateDescription(description)) {
      return res.status(400).json({ error: 'description must be 5–1000 characters' });
    }

    const newResult = await mywineModel.create(req.body);
    res.status(201).json(newResult);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'name must be unique' });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await mywineModel.deleteById(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
