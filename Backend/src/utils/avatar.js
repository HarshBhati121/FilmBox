import { tmdbGet } from "../config/tmdb.js";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w200";

let cachedPosterPaths = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

function hashUsername(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

async function getPosterPaths() {
  const now = Date.now();
  if (cachedPosterPaths?.length && now < cacheExpiry) {
    return cachedPosterPaths;
  }

  const [trending, popular] = await Promise.all([
    tmdbGet("/trending/movie/week"),
    tmdbGet("/movie/popular")
  ]);

  const paths = [...(trending.results || []), ...(popular.results || [])]
    .map((movie) => movie.poster_path)
    .filter(Boolean);

  cachedPosterPaths = [...new Set(paths)];
  cacheExpiry = now + CACHE_TTL_MS;
  return cachedPosterPaths;
}

export async function generateFilmPosterAvatar(username) {
  const paths = await getPosterPaths();
  if (!paths.length) return null;

  const index = hashUsername(username) % paths.length;
  return `${TMDB_IMAGE_BASE}${paths[index]}`;
}

export async function resolveAvatar(username, avatar) {
  if (avatar && !avatar.includes("dicebear")) {
    return avatar;
  }
  return generateFilmPosterAvatar(username);
}
