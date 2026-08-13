const loginRouter = require('express').Router();
const loginService = require('../services/loginService');

loginRouter.post('/', async (req, res, next) => {
  try {
    const { password } = req.body;
    const username =
      typeof req.body.username === 'string' ? req.body.username.trim() : req.body.username;
    const isValid =
      typeof username === 'string' &&
      typeof password === 'string' &&
      username.length > 0 &&
      password.length > 0 &&
      password.length <= 2000;
    if (!isValid) {
      return res.status(401).json({ error: 'invalid username or password' });
    }
    const result = await loginService.loginUser(username, password);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'invalid username or password' });
    }
    next(error);
  }
});

module.exports = loginRouter;
