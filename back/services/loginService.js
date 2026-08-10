const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginUser = async (username, password) => {
  const users = await userModel.getByUsername(username);
  const user = users[0];
  const passwordCorrect =
    user === undefined ? false : await bcrypt.compare(password, user.password_hash);
  if (!(user && passwordCorrect)) {
    throw new Error('invalid username or password');
  }
  const userForToken = {
    username: user.username,
    id: user.id,
  };
  // token expires in 60*60 seconds, that is, in one hour
  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 });
  return { token, username: user.username, name: user.name };
};
module.exports = { loginUser };
