const redis = require('../utils/redis');
const wines = require('../wines.json');

const WINES_CACHE_KEY = 'grapeminds:wines';
const CACHE_TTL = 5184000; // 2kk minuuttia sekunteina
const BASE_URL = process.env.GRAPEMINDS_URL;
console.log('url', process.env.GRAPEMINDS_URL);
const MAX_BROWSABLE_PAGES = 5;

//dev and test uses local json-file, production uses redis cache

// GrapeMinds' paid plan caps usage at 250 requests/month. Track real
// (non-cached) calls in a Redis counter keyed by year-month, so the
// key naturally resets every month, and refuse new calls once the
// quota is used up instead of silently going over.
const MONTHLY_QUOTA = 250;
const QUOTA_KEY_TTL = 40 * 24 * 60 * 60; // outlives the month so the key survives to be read, then a new one starts

const quotaKeyForNow = () => {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `grapeminds:quota:${now.getUTCFullYear()}-${month}`;
};

const trackApiCall = async () => {
  const key = quotaKeyForNow();
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, QUOTA_KEY_TTL);
  }
  if (count > MONTHLY_QUOTA) {
    throw new Error(`GrapeMinds API monthly quota exceeded (${MONTHLY_QUOTA}/month)`);
  }
};

// Two near-simultaneous cache-miss requests for the same key (e.g. React
// StrictMode's double effect invocation, or two users searching the same
// new term at once) would otherwise both call GrapeMinds and burn quota
// for a single logical fetch. Share the in-flight promise instead.
const inFlightRequests = new Map();

const dedupedFetch = (key, fetchFn) => {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  const promise = fetchFn().finally(() => inFlightRequests.delete(key));
  inFlightRequests.set(key, promise);
  return promise;
};

const fetchWinesFromApi = async (page) => {
  // 1.check cache first
  const cacheKey = `${WINES_CACHE_KEY}:page:${page}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('wines from cache');
    // changed string from redis back to json object
    return JSON.parse(cached);
  }
  // // 2. empty Cache t → call API
  return dedupedFetch(cacheKey, async () => {
    await trackApiCall();
    const response = await fetch(`${BASE_URL}/wines?per_page=100&page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.GRAPEMINDS_API_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const wines = await response.json();
    // 3. save Redis TTL, redis saves only text
    await redis.set(cacheKey, JSON.stringify(wines.data), 'EX', CACHE_TTL);
    return wines.data;
  });
};

const MIN_SEARCH_LENGTH = 3;

// GrapeMinds' paid plan allows only 250 requests/month, so search and
// wine-detail lookups are cached the same way as the full catalogue -
// same 60-day TTL, since the underlying data barely changes.
const searchWinesFromApi = async (query) => {
  const cacheKey = `grapeminds:search:${query.toLowerCase()}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  return dedupedFetch(cacheKey, async () => {
    await trackApiCall();
    const response = await fetch(
      `${BASE_URL}/wines/search?q=${encodeURIComponent(query)}&limit=100`,
      { headers: { Authorization: `Bearer ${process.env.GRAPEMINDS_API_KEY}` } }
    );
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const result = await response.json();
    await redis.set(cacheKey, JSON.stringify(result.data), 'EX', CACHE_TTL);
    return result.data;
  });
};

const getAllWines = async (search, page) => {
  if (!search) {
    // No search term: return the full browsable catalogue - the local
    // fixture in dev/test, or the Redis-cached (60-day TTL) GrapeMinds
    // page-1 result in production. Not a search, so no GrapeMinds
    // /wines/search call here.
    if (process.env.NODE_ENV !== 'production') {
      return wines.data; // dev/test does not have pages
    }
    //makes sure it's positive and number and not more than 5
    const clampedPage = Math.min(Math.max(Number(page) || 1, 1), MAX_BROWSABLE_PAGES);
    return fetchWinesFromApi(clampedPage);
  }

  if (process.env.NODE_ENV !== 'production') {
    const lowerSearch = search.toLowerCase();
    return wines.data.filter(
      (wine) =>
        wine.display_name?.toLowerCase().includes(lowerSearch) ||
        wine.type?.toLowerCase().includes(lowerSearch) ||
        wine.sub_type?.toLowerCase().includes(lowerSearch)
    );
  }

  if (search.trim().length < MIN_SEARCH_LENGTH) return [];
  return searchWinesFromApi(search.trim());
};

const getWineById = async (id) => {
  if (process.env.NODE_ENV !== 'production') {
    return wines.data.find((wine) => wine.id === Number(id)) ?? null;
  }

  const cacheKey = `grapeminds:wine:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  return dedupedFetch(cacheKey, async () => {
    await trackApiCall();
    const response = await fetch(`${BASE_URL}/wines/${id}`, {
      headers: { Authorization: `Bearer ${process.env.GRAPEMINDS_API_KEY}` },
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    // Cache 404s too (as null) - a bad/stale id gets requested repeatedly
    // (broken links, bots) and shouldn't cost quota every time.
    const wine = response.status === 404 ? null : await response.json();
    await redis.set(cacheKey, JSON.stringify(wine), 'EX', CACHE_TTL);
    return wine;
  });
};

module.exports = { getAllWines, getWineById };
