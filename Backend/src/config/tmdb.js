export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function cacheKey(endpoint, params) {
  return `${endpoint}?${JSON.stringify(params)}`;
}

export const tmdbGet = async (endpoint, params = {}) => {
  const key = cacheKey(endpoint, params);
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  const queryParams = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY,
    ...params
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message || "TMDB API Error");
    }

    cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (error) {
    if (cached) return cached.data;
    if (error.name === "AbortError") {
      throw new Error("TMDB request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
