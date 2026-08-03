const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

const authenticate = async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' });
    }
    const user = await User.getById(decodedToken.id);

    if (!user) {
      return res.status(401).json({ error: 'token invalid' });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = authenticate;
