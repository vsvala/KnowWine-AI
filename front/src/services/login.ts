import axios from 'axios';
const baseurl = 'api/login';

const login = async (credentials: { username: string; password: string }) => {
  const res = await axios.post(baseurl, credentials, { withCredentials: true });
  return res.data;
};

const logout = async () => {
  await axios.post('/api/login/logout', undefined, { withCredentials: true });
};

export default { login, logout };

