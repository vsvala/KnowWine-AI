const usersRouter = require('express').Router();
const userModel = require('../models/user');
const bcrypt = require('bcrypt');

usersRouter.get('/', async (req, res, next) => {
  try {
    const result = await userModel.getAll();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  try {
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const result = await userModel.getById(id);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  try {
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await userModel.deleteById(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'name must be at least 2 characters' });
    }
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'username must be at least 3 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'username may only contain letters, numbers, and underscores' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const savedUser = await userModel.create(name, username, passwordHash);
    res.status(201).json(savedUser);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'username must be unique' });
    }
    if (error.code === '23514') {
      return res.status(400).json({ error: 'name must be at least 2 characters' });
    }
    next(error);
  }
});

module.exports = usersRouter;