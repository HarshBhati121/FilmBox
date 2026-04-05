import { tmdbGet } from "../config/tmdb.js";

export const searchMovies = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const data = await tmdbGet("/search/movie", { query, page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrendingMovies = async (req, res) => {
  try {
    // We can use timeframe 'day' or 'week'
    const data = await tmdbGet("/trending/movie/week");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbGet(`/movie/${id}`, {
      append_to_response: "credits,videos"
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// If someone specifically wants just the cast
export const getMovieCredits = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbGet(`/movie/${id}/credits`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// e.g. for discovering movies by a specific genre
export const getMoviesByGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbGet("/discover/movie", { with_genres: id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
