const myWinesModel = require('../models/myWines');

const getAllMyWines = async (userId) => {
  return await myWinesModel.getAll(userId);
};

const getMyWineById = async (id) => {
  return await myWinesModel.getById(id);
};

const createMyWine = async ({ name, description, userId }) => {
  try {
    return await myWinesModel.create({ name, description, userId });
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('DUPLICATE_WINE_NAME', { cause: error });
    }
    throw error;
  }
};

const deleteMyWineById = async (id) => {
  const wine = await myWinesModel.getById(id);
  if (!wine) {
    throw new Error('Wine not found');
  }
  await myWinesModel.deleteById(id);
};

module.exports = { getAllMyWines, getMyWineById, createMyWine, deleteMyWineById };
