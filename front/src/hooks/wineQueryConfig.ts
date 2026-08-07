// The wine catalog is sourced from the backend's Redis cache (CACHE_TTL in
// back/services/winesService.js), which is refreshed at most every 60 days.
// Client-side data can't be any fresher than that, so treat it as fresh for
// the same window instead of refetching in the background, and keep it in
// the query cache for the same window instead of evicting it after the
// default 5 min of inactivity.
// staleTime: how long the data stays "fresh" - within this window react-query
// serves the cached data as-is instead of refetching in the background (e.g.
// on mount or window focus).
export const WINES_STALE_TIME_MS = 60 * 24 * 60 * 60 * 1000;

// gcTime: how long the data stays in memory after no component is using it
// anymore (e.g. the user navigates away). Default is 5 min, after which the
// data is evicted and the next use triggers a fresh fetch.
export const WINES_GC_TIME_MS = WINES_STALE_TIME_MS;
