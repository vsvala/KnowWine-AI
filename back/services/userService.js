const userModel = require('../models/user');

const getAllUsers = async () => {
  return await userModel.getAll();
};

const getUserById = async (id) => {
  return await userModel.getById(id);
};

const createUser = async (name, username, passwordHash) => {
  const newUser = await userModel.create(name, username, passwordHash);
  if (!newUser) {
    throw new Error('User not created');
  }
  return newUser;
};

const deleteUserById = async (id) => {
  const user = await userModel.getById(id);
  if (!user) {
    throw new Error('User not found');
  }
  await userModel.deleteById(id);
};

module.exports = { getAllUsers, getUserById, deleteUserById, createUser };
