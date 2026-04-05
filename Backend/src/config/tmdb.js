export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const tmdbGet = async (endpoint, params = {}) => {
  const queryParams = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY,
    ...params
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.status_message || "TMDB API Error");
  }

  return data;
};
