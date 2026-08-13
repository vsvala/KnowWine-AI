import axios from 'axios';
const baseUrl = '/api/users';

let token: string | null = null;

const setToken = (newToken: string) => {
  token = `Bearer ${newToken}`;
};

const getAll = () => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.get(baseUrl, config);
  return request.then((response) => response.data);
};
export default { getAll, setToken };

//using pure fetch instead of axios to avoid adding axios as a dependency for this service

// export default { getAll, setToken };

// const baseUrl = '/api/users';

// let token: string | null = null;

// const setToken = (newToken: string) => {
//   token = `Bearer ${newToken}`;
// };

// const getAll = async () => {
//   const config: RequestInit = {
//     headers: token ? { Authorization: token } : undefined,
//   };
//   const response = await fetch(baseUrl, config);
//   if(!response.ok) {
//     throw new Error('Failed to fetch users');
//   }
//   return await response.json()
// };


