const myWinesModel = require('../models/myWines');

const getAllMyWines = async () => {
  const myWines = await myWinesModel.getAll();
  if (!myWines) {
    throw new Error('myWines not found');
  }
  return myWines;
};

const getMyWineById = async (id) => {
  const wine = await myWinesModel.getById(id);
  if (!wine) {
    throw new Error('Wine not found');
  }
  return wine;
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
