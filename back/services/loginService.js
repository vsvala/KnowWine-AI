const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const refreshTokenModel = require('../models/refreshToken');
const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL) || 900; // 15 min
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL) || 604800; // 7 vrk

const loginUser = async (username, password) => {
  const users = await userModel.getByUsername(username);
  const user = users[0];
  const passwordCorrect =
    user === undefined ? false : await bcrypt.compare(password, user.password_hash);
  if (!(user && passwordCorrect)) {
    throw new Error('INVALID_CREDENTIALS');
  }
  const userForToken = {
    username: user.username,
    id: user.id,
  };
  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: ACCESS_TOKEN_TTL });
  const refreshToken = jwt.sign(userForToken, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
  await refreshTokenModel.create(user.id, tokenHash, expiresAt);

  return { token, refreshToken, username: user.username, name: user.name };
};
module.exports = { loginUser };
