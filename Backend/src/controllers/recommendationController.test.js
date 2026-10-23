import test from "node:test";
import assert from "node:assert/strict";
import {
  createHistoryRecommendationHandler,
  createRecommendationHandler
} from "./recommendationController.js";

const preferences = {
  genres: ["Sci-Fi"],
  moods: ["Mind-bending plots"],
  duration: "any",
  minRating: 6,
  releasePeriod: "any",
  language: "any",
  excludeGenres: [],
  discoveryStyle: "mixed",
  favoriteMovies: []
};
const candidate = {
  id: 55,
  title: "Verified Film",
  release_date: "2022-01-01",
  overview: "A verified synopsis.",
  genres: [{ id: 878, name: "Sci-Fi" }],
  vote_average: 7.6,
  runtime: 111,
  original_language: "en",
  popularity: 10
};

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test("rejects invalid preferences before calling recommendation providers", async () => {
  let providerCalled = false;
  const handler = createRecommendationHandler({
    getCandidates: async () => {
      providerCalled = true;
      return [];
    }
  });
  const res = responseRecorder();

  await handler({ body: { ...preferences, genres: ["invalid"] }, userId: "invalid-user" }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(providerCalled, false);
  assert.ok(Array.isArray(res.body.errors));
});

test("returns TMDB-verified Gemini-ranked films", async () => {
  const handler = createRecommendationHandler({
    getCandidates: async () => [candidate],
    getAiRecommendations: async () => [{
      ...candidate,
      matchScore: 88,
      matchCategory: "Strong match",
      reason: "It fits your interest in speculative stories.",
      enjoyment: "You may enjoy its imaginative premise.",
      characteristics: ["Sci-Fi"]
    }]
  });
  const res = responseRecorder();

  await handler({ body: preferences, userId: "ai-user" }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.source, "gemini");
  assert.equal(res.body.recommendations[0].id, candidate.id);
  assert.equal(res.body.recommendations[0].title, candidate.title);
});

test("falls back to preference-ranked TMDB results if Gemini fails", async () => {
  const handler = createRecommendationHandler({
    getCandidates: async () => [candidate],
    getAiRecommendations: async () => { throw new Error("provider unavailable"); }
  });
  const res = responseRecorder();

  await handler({ body: preferences, userId: "fallback-user" }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.source, "tmdb");
  assert.equal(res.body.recommendations[0].id, candidate.id);
  assert.match(res.body.recommendations[0].reason, /Sci-Fi/);
});

test("returns a useful upstream error when TMDB candidate loading fails", async () => {
  const handler = createRecommendationHandler({
    getCandidates: async () => { throw new Error("TMDB unavailable"); }
  });
  const res = responseRecorder();

  await handler({ body: preferences, userId: "tmdb-failure-user" }, res);

  assert.equal(res.statusCode, 502);
  assert.match(res.body.message, /TMDB/);
});

test("ranks history-based candidates with Gemini using the user's history", async () => {
  let receivedHistory;
  const handler = createHistoryRecommendationHandler({
    getHistory: async () => ({
      movies: [{ id: 12, title: "Watched Film", genres: [{ name: "Sci-Fi" }], rating: 4.5 }],
      searchedTerms: ["space exploration"]
    }),
    getCandidates: async (history) => ({
      movies: history.movies,
      candidates: [candidate]
    }),
    getAiRecommendations: async (history, candidates) => {
      receivedHistory = history;
      return [{
        ...candidates[0],
        matchScore: 90,
        matchCategory: "Strong match",
        reason: "It fits your viewing history.",
        enjoyment: "You may enjoy its story.",
        characteristics: ["Sci-Fi"]
      }];
    }
  });
  const res = responseRecorder();

  await handler({ userId: "history-ai-user" }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.source, "gemini");
  assert.equal(res.body.basis, "history");
  assert.deepEqual(receivedHistory.searchedTerms, ["space exploration"]);
  assert.equal(res.body.recommendations[0].id, candidate.id);
});

test("returns guidance when a user has no viewing or search history", async () => {
  let candidateProviderCalled = false;
  const handler = createHistoryRecommendationHandler({
    getHistory: async () => ({ movies: [], searchedTerms: [] }),
    getCandidates: async () => {
      candidateProviderCalled = true;
      return { movies: [], candidates: [] };
    }
  });
  const res = responseRecorder();

  await handler({ userId: "new-history-user" }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(candidateProviderCalled, false);
  assert.equal(res.body.recommendations.length, 0);
  assert.match(res.body.message, /Watch or rate films/);
});

test("falls back to history-ranked TMDB recommendations when Gemini is unavailable", async () => {
  const handler = createHistoryRecommendationHandler({
    getHistory: async () => ({
      movies: [{ id: 12, title: "Watched Film", genres: [{ name: "Sci-Fi" }] }],
      searchedTerms: []
    }),
    getCandidates: async (history) => ({
      movies: history.movies,
      candidates: [candidate]
    }),
    getAiRecommendations: async () => { throw new Error("provider unavailable"); }
  });
  const res = responseRecorder();

  await handler({ userId: "history-fallback-user" }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.source, "tmdb");
  assert.match(res.body.recommendations[0].reason, /Sci-Fi/);
});
