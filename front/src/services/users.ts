// Auth is handled by the shared apiClient, not by this module: its request
// interceptor attaches the Authorization header on every call, and its
// response interceptor transparently refreshes an expired access token
// (via the httpOnly refresh cookie) and retries the request once.
import api from './apiClient';
const { apiClient } = api;

const baseUrl = '/users';

const getAll = () => {
  const request = apiClient.get(baseUrl);
  return request.then((response) => response.data);
};

export default { getAll };

