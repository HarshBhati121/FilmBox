import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDiscoverParams,
  buildFallbackRecommendations,
  buildHistoryFallbackRecommendations,
  filterCandidates,
  validateGeminiRecommendations,
  validatePreferences
} from "./recommendationUtils.js";

const validInput = {
  genres: ["Sci-Fi"],
  moods: ["Mind-bending plots"],
  duration: "medium",
  minRating: 6,
  releasePeriod: "any",
  language: "en",
  excludeGenres: ["Horror"],
  discoveryStyle: "hidden-gems",
  favoriteMovies: ["Arrival"]
};

const movie = (overrides = {}) => ({
  id: 100,
  title: "A Thoughtful Film",
  release_date: "2022-03-10",
  overview: "A surreal story about reality and time.",
  genres: [{ id: 878, name: "Sci-Fi" }],
  vote_average: 7.8,
  runtime: 110,
  original_language: "en",
  popularity: 12,
  ...overrides
});

test("normalizes valid preferences and rejects unsupported input", () => {
  const valid = validatePreferences(validInput);
  assert.deepEqual(valid.errors, []);
  assert.equal(valid.preferences.genres[0], "Sci-Fi");
  assert.deepEqual(validatePreferences({ ...validInput, genres: ["Made-up genre"] }).errors.length, 1);
  assert.ok(validatePreferences({ ...validInput, minRating: 4 }).errors.length > 0);
  assert.ok(validatePreferences({ ...validInput, favoriteMovies: ["x", "y", "z", "w"] }).errors.length > 0);
});

test("requires a genre or at least one favorite movie", () => {
  const result = validatePreferences({
    ...validInput,
    genres: [],
    favoriteMovies: []
  });
  assert.ok(result.errors.some((error) => error.includes("at least one genre")));
});

test("builds TMDB discovery parameters from release and taste preferences", () => {
  const params = buildDiscoverParams({ ...validInput, releasePeriod: "1990s" });
  assert.equal(params.with_genres, "878");
  assert.equal(params.without_genres, "27");
  assert.equal(params.with_original_language, "en");
  assert.equal(params["primary_release_date.gte"], "1990-01-01");
  assert.equal(params["primary_release_date.lte"], "1999-12-31");
  assert.equal(params["vote_count.gte"], "25");
});

test("filters candidates by genre, excluded genre, rating, language, runtime and release period", () => {
  const preferences = validatePreferences(validInput).preferences;
  const filtered = filterCandidates([
    movie(),
    movie({ id: 101, runtime: 130 }),
    movie({ id: 102, vote_average: 5.5 }),
    movie({ id: 103, original_language: "ja" }),
    movie({ id: 104, genres: [{ id: 27, name: "Horror" }] })
  ], preferences);
  assert.deepEqual(filtered.map((candidate) => candidate.id), [100]);
});

test("uses only verified candidate IDs and allows only explanation fields from Gemini", () => {
  const candidate = movie();
  const recommendations = validateGeminiRecommendations({
    recommendations: [
      { id: 100, matchScore: 91, reason: "It matches your taste.", enjoyment: "Enjoy the reveal.", characteristics: ["Sci-Fi"] },
      { id: 999, matchScore: 99, reason: "Invented film." },
      { id: 100, matchScore: 95, reason: "Duplicate." },
      { id: 100, matchScore: 120, reason: "Invalid score." }
    ]
  }, [candidate]);

  assert.equal(recommendations.length, 1);
  assert.equal(recommendations[0].title, candidate.title);
  assert.equal(recommendations[0].vote_average, candidate.vote_average);
  assert.equal(recommendations[0].matchScore, 91);
  assert.equal(recommendations[0].reason, "It matches your taste.");
});

test("TMDB fallback ranks preference matches and creates user-facing explanations", () => {
  const preferences = validatePreferences(validInput).preferences;
  const ranked = buildFallbackRecommendations([
    movie({ id: 100, genres: [{ id: 878, name: "Sci-Fi" }], vote_average: 7.8 }),
    movie({ id: 101, genres: [{ id: 35, name: "Comedy" }], vote_average: 8.5 })
  ], preferences);
  assert.equal(ranked[0].id, 100);
  assert.match(ranked[0].reason, /Sci-Fi/);
  assert.ok(ranked[0].matchScore > 0);
});

test("history fallback prioritizes genres from watched and rated films", () => {
  const ranked = buildHistoryFallbackRecommendations([
    movie({ id: 100, genres: [{ id: 878, name: "Sci-Fi" }], vote_average: 7.8 }),
    movie({ id: 101, genres: [{ id: 35, name: "Comedy" }], vote_average: 8.5 })
  ], {
    movies: [{ id: 10, genres: [{ name: "Sci-Fi" }, { name: "Drama" }] }],
    searchedTerms: ["space"]
  });

  assert.equal(ranked[0].id, 100);
  assert.match(ranked[0].reason, /Sci-Fi/);
  assert.equal(ranked.length, 2);
});
