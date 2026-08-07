//Axios is a Promise-based HTTP client for browsers and Node.js used
// to make HTTP requests (GET/POST/PUT/DELETE, etc.) works with server-side code and APIs.
import axios from 'axios';

//let token: string | null = null;
// const setToken = (newToken: string) => {
//   token = `Bearer ${newToken}`;
// };

const baseUrl = '/api/wines';
//'http://localhost:3001/api/wines'

const getAll = (page: number = 1) => {
  const request = axios.get(baseUrl, { params: { page } });
  return request.then((response) => response.data);
};

const searchAll = (term: string) => {
  const request = axios.get(baseUrl, { params: { search: term } });
  return request.then((response) => response.data);
};

const getById = (id: number) => axios.get(`${baseUrl}/${id}`).then((r) => r.data);

export default {
  getAll, searchAll, getById
  //setToken
};
