import axios from 'axios';
const baseurl = '/api/location';

const getLocation = async (coords: [number, number]) => {
  const request = await axios.get(`${baseurl}?lat=${coords[1]}&lon=${coords[0]}`);
  return request.data;
};

export default { getLocation };
