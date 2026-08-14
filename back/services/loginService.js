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

  return { token, refreshToken, username: user.username, name: user.name, id: user.id };
};
const refreshAccessToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw new Error('MISSING_REFRESH_TOKEN');
  }
  const decoded = jwt.verify(rawRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const stored = await refreshTokenModel.findValidByHash(tokenHash);
  if (!stored) {
    // Tokenia ei löydy voimassaolevana — joko jo käytetty (rotatoitu) tai
    // mitätöity. Kummassakin tapauksessa kyseessä voi olla varastettu token,
    // joten mitätöidään käyttäjän kaikki tokenit varotoimena.
    await refreshTokenModel.revokeAllForUser(decoded.id);
    throw new Error('REFRESH_TOKEN_REUSED');
  }
  await refreshTokenModel.revoke(stored.id);

  const userForToken = { username: decoded.username, id: decoded.id };
  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: ACCESS_TOKEN_TTL });
  const refreshToken = jwt.sign(userForToken, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
  const newHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

  await refreshTokenModel.create(decoded.id, newHash, expiresAt);

  const user = await userModel.getById(decoded.id);
  return { token, refreshToken, username: user.username, name: user.name, id: user.id };
};
const logoutUser = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await refreshTokenModel.revokeByHash(tokenHash);
};
module.exports = { loginUser, logoutUser, refreshAccessToken };
