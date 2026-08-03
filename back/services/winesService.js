const redis = require('../utils/redis');
const wines = require('../wines.json');

const WINES_CACHE_KEY = 'grapeminds:wines';
const CACHE_TTL = 5184000; // 2kk minuuttia sekunteina
const BASE_URL = process.env.GRAPEMINDS_URL;
console.log('url', process.env.GRAPEMINDS_URL);

//dev and test uses local json-file, production uses redis cache

const fetchWinesFromApi = async () => {
  // 1.check cache first
  const cached = await redis.get(WINES_CACHE_KEY);
  if (cached) {
    console.log('wines from cache');
    // changed string from redis back to json object
    return JSON.parse(cached);
  }
  // // 2. empty Cache t → call API
  const response = await fetch(`${BASE_URL}/wines?per_page=100&page=1`, {
    headers: {
      Authorization: `Bearer ${process.env.GRAPEMINDS_API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const wines = await response.json();
  // 3. save Redis TTL, redis saves only text
  await redis.set(WINES_CACHE_KEY, JSON.stringify(wines.data), 'EX', CACHE_TTL);
  //console.log(wines.data);
  return wines.data;
};

const getAllWines = async () => {
  if (process.env.NODE_ENV !== 'production') {
    return wines.data;
  }
  return fetchWinesFromApi();
};

module.exports = { getAllWines };
