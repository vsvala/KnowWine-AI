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

    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ token: result.token, username: result.username, name: result.name });
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'invalid username or password' });
    }
    next(error);
  }
});
// Sets the refresh token as an httpOnly, SameSite=Lax cookie scoped to the
// refresh endpoint only, so client-side JS never sees it and it isn't sent
// on unrelated requests.
const setRefreshCookie = (res, refreshToken) => {
  res.cookie(process.env.COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Number(process.env.REFRESH_TOKEN_TTL) * 1000,
    path: '/api/login/refresh',
  });
};

loginRouter.post('/refresh', async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies[process.env.COOKIE_NAME];
    const result = await loginService.refreshAccessToken(rawRefreshToken);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ token: result.token, username: result.username, name: result.name, id: result.id });
  } catch (error) {
    if (
      error.message === 'MISSING_REFRESH_TOKEN' ||
      error.message === 'REFRESH_TOKEN_REUSED' ||
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      res.clearCookie(process.env.COOKIE_NAME, { path: '/api/login/refresh' });
      return res.status(401).json({ error: 'invalid refresh token' });
    }
    next(error);
  }
});

loginRouter.post('/logout', async (req, res, next) => {
  try {
    // Read the refresh token cookie sent by the browser so it can be revoked in the DB.
    const rawRefreshToken = req.cookies[process.env.COOKIE_NAME];
    await loginService.logoutUser(rawRefreshToken);
    res.clearCookie(process.env.COOKIE_NAME, { path: '/api/login/refresh' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = loginRouter;
