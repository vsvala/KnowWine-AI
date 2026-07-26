//Axios is a Promise-based HTTP client for browsers and Node.js used
// to make HTTP requests (GET/POST/PUT/DELETE, etc.) works with server-side code and APIs.
import axios from 'axios';

let token: string | null = null;

const setToken = (newToken: string) => {
  token = `Bearer ${newToken}`;
};

const baseUrl = '/api/mywines';
//'http://localhost:3001/api/mywines'
type ItemInput = {
  name: string;
  description: string;
};

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const create = (newObject: ItemInput) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.post(baseUrl, newObject, config);
  return request.then((response) => response.data);
};

const update = (id: number, newObject: ItemInput) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject);
  return request.then((response) => response.data);
};

const deleteWine = (id: number) => {
  console.log('axios.delete');
  const config = {
    headers: { Authorization: token },
  };
  return axios.delete(`${baseUrl}/${id}`, config);
};

export default {
  getAll,
  create,
  update,
  deleteWine,
  setToken,
};
