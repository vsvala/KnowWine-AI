// REST client for the /api/mywines backend resource (GET/POST/PUT/DELETE).

import api from './apiClient';

const { apiClient } = api;

const baseUrl = '/mywines';
type ItemInput = {
  name: string;
  description: string;
};

const getAll = () => {
  const request = apiClient.get(baseUrl);
  return request.then((response) => response.data);
};

const create = (newObject: ItemInput) => {
  const request = apiClient.post(baseUrl, newObject);
  return request.then((response) => response.data);
};

const update = (id: number, newObject: ItemInput) => {
  const request = apiClient.put(`${baseUrl}/${id}`, newObject);
  return request.then((response) => response.data);
};

const deleteWine = (id: number) => {
  const request = apiClient.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
};

export default {
  getAll,
  create,
  update,
  deleteWine,
};
