const usersRouter = require('express').Router();
const userService = require('../services/userService');
const bcrypt = require('bcrypt');
const authenticate = require('../utils/authenticate');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../utils/validate');

const createUserValidation = [
  body('name')
    .isString()
    .withMessage('name must be a string')
    .trim()
    .isLength({ min: 2 })
    .withMessage('name must be at least 2 characters'),
  body('username')
    .isString()
    .withMessage('username must be a string')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('username may only contain letters, numbers, and underscores'),
  body('password')
    .isString()
    .withMessage('password must be a string')
    .isLength({ min: 8, max: 2000 })
    .withMessage('password must be 8-2000 characters'),
];

usersRouter.get('/', async (req, res, next) => {
  try {
    const result = await userService.getAllUsers();
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
    const result = await userService.getUserById(id);
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', createUserValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const savedUser = await userService.createUser(name, username, passwordHash);
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

usersRouter.delete('/:id', authenticate, async (req, res, next) => {
  const id = Number(req.params.id);
  try {
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await userService.deleteUserById(id);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
