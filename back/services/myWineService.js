const myWinesModel = require('../models/myWines');

const getAllMyWines = async (userId) => {
  return await myWinesModel.getAll(userId);
};

const getMyWineById = async (id) => {
  return await myWinesModel.getById(id);
};

const createMyWine = async ({ name, description, userId }) => {
  const newWine = await myWinesModel.create({ name, description, userId });
  if (!newWine) {
    throw new Error('Failed to create wine');
  }
  return newWine;
};

const deleteMyWineById = async (id) => {
  const wine = await myWinesModel.getById(id);
  if (!wine) {
    throw new Error('Wine not found');
  }
  await myWinesModel.deleteById(id);
};

module.exports = { getAllMyWines, getMyWineById, createMyWine, deleteMyWineById };
