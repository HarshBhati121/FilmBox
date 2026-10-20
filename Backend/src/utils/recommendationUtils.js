export const GENRES = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Sci-Fi": 878,
  Thriller: 53,
  War: 10752,
  Western: 37
};

export const MOODS = [
  "Mind-bending plots",
  "Emotional stories",
  "Realistic dramas",
  "Suspense",
  "Comedy",
  "Inspiring stories",
  "Visually stunning films"
];

const DURATIONS = new Set(["short", "medium", "long", "any"]);
const DISCOVERY_STYLES = new Set([
  "popular",
  "underrated",
  "critically-acclaimed",
  "hidden-gems",
  "mixed"
]);
const RELEASE_PERIODS = new Set(["any", "recent", "classic"]);
const MAX_FAVORITES = 3;

function cleanString(value, maxLength) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength)
    : "";
}

function cleanStringArray(value, allowedValues, maxItems, fieldName, errors) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be a list.`);
    return [];
  }
  if (value.length > maxItems) errors.push(`${fieldName} has too many selections.`);

  const values = [...new Set(value)];
  const invalid = values.filter((item) => !allowedValues.includes(item));
  if (invalid.length) errors.push(`${fieldName} contains an unsupported option.`);
  return values.filter((item) => allowedValues.includes(item)).slice(0, maxItems);
}

export function validatePreferences(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { errors: ["Preferences must be an object."] };
  }

  const genreNames = Object.keys(GENRES);
  const genres = cleanStringArray(input.genres, genreNames, genreNames.length, "Genres", errors);
  const excludeGenres = cleanStringArray(
    input.excludeGenres,
    genreNames,
    genreNames.length,
    "Excluded genres",
    errors
  );
  const moods = cleanStringArray(input.moods, MOODS, MOODS.length, "Moods", errors);

  const rawFavorites = input.favoriteMovies === undefined ? [] : input.favoriteMovies;
  if (!Array.isArray(rawFavorites)) errors.push("Favorite movies must be a list.");
  if (Array.isArray(rawFavorites) && rawFavorites.length > MAX_FAVORITES) {
    errors.push(`Choose no more than ${MAX_FAVORITES} favorite movies.`);
  }
  if (Array.isArray(rawFavorites) && rawFavorites.some((title) => typeof title !== "string")) {
    errors.push("Favorite movie titles must be text.");
  }
  const favoriteMovies = Array.isArray(rawFavorites)
    ? [...new Set(rawFavorites.map((title) => cleanString(title, 80)).filter(Boolean))].slice(0, MAX_FAVORITES)
    : [];

  const duration = input.duration === undefined ? "any" : input.duration;
  if (!DURATIONS.has(duration)) errors.push("Choose a valid movie duration.");

  const minRating = input.minRating === undefined ? 6 : Number(input.minRating);
  if (![5, 6, 7, 8].includes(minRating)) errors.push("Choose a valid minimum rating.");

  const releasePeriod = input.releasePeriod === undefined ? "any" : input.releasePeriod;
  const isDecade = typeof releasePeriod === "string" && /^(19|20)\d0s$/.test(releasePeriod);
  if (!RELEASE_PERIODS.has(releasePeriod) && !isDecade) {
    errors.push("Choose a valid release period.");
  }

  const language = input.language === undefined ? "any" : input.language;
  if (language !== "any" && (typeof language !== "string" || !/^[a-z]{2}$/.test(language))) {
    errors.push("Choose a valid movie language.");
  }

  const discoveryStyle = input.discoveryStyle === undefined ? "mixed" : input.discoveryStyle;
  if (!DISCOVERY_STYLES.has(discoveryStyle)) errors.push("Choose a valid discovery style.");
  if (genres.length === 0 && favoriteMovies.length === 0) {
    errors.push("Choose at least one genre or enter a favorite movie.");
  }

  if (errors.length) return { errors };

  return {
    errors: [],
    preferences: {
      genres,
      moods,
      duration,
      minRating,
      releasePeriod,
      language,
      excludeGenres,
      discoveryStyle,
      favoriteMovies
    }
  };
}

export function buildDiscoverParams(preferences, page = 1) {
  const params = {
    include_adult: "false",
    page: String(page),
    sort_by: preferences.discoveryStyle === "popular"
      ? "popularity.desc"
      : preferences.discoveryStyle === "underrated" || preferences.discoveryStyle === "hidden-gems"
        ? "vote_average.desc"
        : preferences.discoveryStyle === "critically-acclaimed"
          ? "vote_average.desc"
          : "popularity.desc",
    "vote_average.gte": String(preferences.minRating),
    "vote_count.gte": preferences.discoveryStyle === "hidden-gems"
      ? "25"
      : preferences.discoveryStyle === "underrated"
        ? "100"
        : preferences.discoveryStyle === "critically-acclaimed"
          ? "500"
          : "50"
  };

  const genreIds = preferences.genres.map((genre) => GENRES[genre]);
  const excludedIds = preferences.excludeGenres.map((genre) => GENRES[genre]);
  if (genreIds.length) params.with_genres = genreIds.join("|");
  if (excludedIds.length) params.without_genres = excludedIds.join(",");
  if (preferences.language !== "any") params.with_original_language = preferences.language;

  const currentYear = new Date().getFullYear();
  if (preferences.releasePeriod === "recent") {
    params["primary_release_date.gte"] = `${currentYear - 5}-01-01`;
  } else if (preferences.releasePeriod === "classic") {
    params["primary_release_date.lte"] = "1980-12-31";
  } else if (/^(19|20)\d0s$/.test(preferences.releasePeriod)) {
    const startYear = Number(preferences.releasePeriod.slice(0, 4));
    params["primary_release_date.gte"] = `${startYear}-01-01`;
    params["primary_release_date.lte"] = `${startYear + 9}-12-31`;
  }

  return params;
}

export function filterCandidates(candidates, preferences) {
  return candidates.filter((movie) => {
    if (!movie || !movie.id || !movie.title || !movie.release_date) return false;
    if (Number(movie.vote_average) < preferences.minRating) return false;
    if (preferences.language !== "any" && movie.original_language !== preferences.language) return false;

    const genreIds = (movie.genres || []).map((genre) => genre.id);
    if (preferences.genres.length && !preferences.genres.some((genre) => genreIds.includes(GENRES[genre]))) {
      return false;
    }
    if (preferences.excludeGenres.some((genre) => genreIds.includes(GENRES[genre]))) return false;

    const runtime = Number(movie.runtime) || 0;
    if (preferences.duration === "short" && (!runtime || runtime >= 90)) return false;
    if (preferences.duration === "medium" && (runtime < 90 || runtime > 120)) return false;
    if (preferences.duration === "long" && runtime <= 120) return false;

    const year = Number(movie.release_date.slice(0, 4));
    if (preferences.releasePeriod === "recent" && year < new Date().getFullYear() - 5) return false;
    if (preferences.releasePeriod === "classic" && year > 1980) return false;
    if (/^(19|20)\d0s$/.test(preferences.releasePeriod)) {
      const decade = Number(preferences.releasePeriod.slice(0, 4));
      if (year < decade || year > decade + 9) return false;
    }

    return true;
  });
}

function fallbackScore(movie, preferences) {
  const movieGenres = (movie.genres || []).map((genre) => genre.name);
  const matchingGenres = preferences.genres.filter((genre) => movieGenres.includes(genre));
  let score = 48 + (matchingGenres.length ? 18 + matchingGenres.length * 4 : 0);
  const description = `${movie.title} ${movie.overview || ""}`.toLowerCase();
  const moodTerms = {
    "Mind-bending plots": ["twist", "mystery", "reality", "secret", "surreal", "time"],
    "Emotional stories": ["love", "family", "loss", "friendship", "life", "heart"],
    "Realistic dramas": ["true", "real", "society", "family", "life", "based on"],
    Suspense: ["danger", "murder", "chase", "mystery", "survive", "secret"],
    Comedy: ["comedy", "funny", "humor", "hilarious", "laugh"],
    "Inspiring stories": ["journey", "dream", "overcome", "hope", "inspire", "challenge"],
    "Visually stunning films": ["world", "visual", "journey", "fantasy", "space", "adventure"]
  };
  const matchedMood = preferences.moods.some((mood) =>
    moodTerms[mood].some((term) => description.includes(term))
  );
  if (matchedMood) score += 7;
  score += Math.min(10, Math.max(0, Number(movie.vote_average) - preferences.minRating));
  if (preferences.discoveryStyle === "popular") {
    score += Math.min(5, Math.log10(Math.max(1, Number(movie.popularity) || 1)));
  } else if (preferences.discoveryStyle === "critically-acclaimed") {
    score += Math.min(6, Math.max(0, Number(movie.vote_average) - 7));
  } else if (preferences.discoveryStyle === "hidden-gems") {
    score += Number(movie.popularity) < 20 ? 5 : 0;
  } else if (preferences.discoveryStyle === "underrated") {
    score += Number(movie.vote_average) >= 7 ? 4 : 0;
  }
  return Math.min(96, Math.round(score));
}

export function buildFallbackRecommendations(candidates, preferences, limit = 8) {
  return candidates
    .map((movie) => {
      const matchScore = fallbackScore(movie, preferences);
      const matchingGenres = preferences.genres.filter((genre) =>
        (movie.genres || []).some((movieGenre) => movieGenre.name === genre)
      );
      const genreReason = matchingGenres.length
        ? `It matches your interest in ${matchingGenres.slice(0, 2).join(" and ")}.`
        : "It fits the discovery style you selected.";
      return {
        ...movie,
        matchScore,
        matchCategory: matchScore >= 80 ? "Strong match" : matchScore >= 65 ? "Good match" : "Worth a look",
        reason: genreReason,
        enjoyment: preferences.moods.length
          ? `You may enjoy its fit with your preference for ${preferences.moods[0].toLowerCase()}.`
          : "Its verified TMDB details fit the filters you selected.",
        characteristics: matchingGenres.slice(0, 3)
      };
    })
    .sort((left, right) =>
      right.matchScore - left.matchScore ||
      Number(right.vote_average) - Number(left.vote_average) ||
      Number(right.popularity) - Number(left.popularity)
    )
    .slice(0, limit);
}

export function validateGeminiRecommendations(response, candidates, limit = 8) {
  if (!response || !Array.isArray(response.recommendations)) return [];
  const candidateMap = new Map(candidates.map((movie) => [Number(movie.id), movie]));
  const usedIds = new Set();
  const validated = [];

  for (const item of response.recommendations) {
    if (!item || !Number.isInteger(Number(item.id))) continue;
    const id = Number(item.id);
    const movie = candidateMap.get(id);
    const matchScore = Number(item.matchScore);
    const reason = cleanString(item.reason, 240);
    const enjoyment = cleanString(item.enjoyment, 240);
    if (!movie || usedIds.has(id) || !Number.isFinite(matchScore) || matchScore < 0 || matchScore > 100 || !reason) {
      continue;
    }

    usedIds.add(id);
    const characteristics = Array.isArray(item.characteristics)
      ? item.characteristics
        .filter((value) => typeof value === "string")
        .map((value) => cleanString(value, 50))
        .filter(Boolean)
        .slice(0, 5)
      : [];
    validated.push({
      ...movie,
      matchScore: Math.round(matchScore),
      matchCategory: matchScore >= 80 ? "Strong match" : matchScore >= 65 ? "Good match" : "Worth a look",
      reason,
      enjoyment,
      characteristics
    });
    if (validated.length >= limit) break;
  }

  return validated;
}
