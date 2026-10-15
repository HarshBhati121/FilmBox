import { movieApi } from '../api/client';

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w200';

let posterPaths = [];
let initPromise = null;

function hashUsername(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function initAvatarPosters() {
  if (!initPromise) {
    initPromise = movieApi
      .trending()
      .then((data) => {
        posterPaths = (data.results || [])
          .map((movie) => movie.poster_path)
          .filter(Boolean);
      })
      .catch(() => {
        posterPaths = [];
      });
  }
  return initPromise;
}

function posterFromUsername(username) {
  if (!posterPaths.length) return '';
  const index = hashUsername(username) % posterPaths.length;
  return `${IMAGE_BASE}${posterPaths[index]}`;
}

export function getAvatarUrl(user) {
  if (!user) return posterFromUsername('guest');
  if (user.avatar && !user.avatar.includes('dicebear')) {
    return user.avatar;
  }
  return posterFromUsername(user.username || 'guest');
}
