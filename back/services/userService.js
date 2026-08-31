const userModel = require('../models/user');
const bcrypt = require('bcrypt');

const getAllUsers = async () => {
  return await userModel.getAll();
};

const getUserById = async (id) => {
  return await userModel.getById(id);
};

const createUser = async (name, username, password) => {
  const SALT_ROUNDS = 10;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    return await userModel.create(name, username, passwordHash);
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('DUPLICATE_USERNAME', { cause: error });
    }
    if (error.code === '23514') {
      throw new Error('NAME_TOO_SHORT', { cause: error });
    }
    throw error;
  }
};

const setUserRole = async (id, role) => {
  const allowed = ['member', 'admin'];
  if (!allowed.includes(role)) throw new Error('INVALID_ROLE');
  const user = await userModel.getById(id);
  if (!user) throw new Error('USER_NOT_FOUND');
  await userModel.setRole(id, role);
  return await userModel.getById(id);
};

const deleteUserById = async (id) => {
  const user = await userModel.getById(id);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }
  await userModel.deleteById(id);
};

module.exports = { getAllUsers, getUserById, deleteUserById, createUser, setUserRole };
