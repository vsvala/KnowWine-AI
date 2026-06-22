import axios from 'axios';
const baseurl = 'api/login';

const login = async (credentials: { username: string; password: string }) => {
  const res = await axios.post(baseurl, credentials);
  return res.data;
};

export default { login };
