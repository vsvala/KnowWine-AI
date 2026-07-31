const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const userModel = require('../models/user');

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

    const users = await userModel.getByUsername(username);
    const user = users[0];

    const passwordCorrect =
      user === undefined ? false : await bcrypt.compare(password, user.password_hash);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({ error: 'invalid username or password' });
    }

    const userForToken = {
      username: user.username,
      id: user.id,
    };
    // token expires in 60*60 seconds, that is, in one hour
    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 });
    res.status(200).send({ token, username: user.username, name: user.name });
  } catch (error) {
    next(error);
  }
});

module.exports = loginRouter;
