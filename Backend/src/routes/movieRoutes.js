import express from "express";
import {
  searchMovies,
  getTrendingMovies,
  getMovieDetails,
  getMovieCredits,
  getMoviesByGenre,
  getSimilarMovies,
  searchTv,
  getTrendingTv,
  getTvDetails
} from "../controllers/movieController.js";

const router = express.Router();

router.get("/search", searchMovies);
router.get("/trending", getTrendingMovies);
router.get("/genre/:id", getMoviesByGenre);
router.get("/:id/similar", getSimilarMovies);
router.get("/:id", getMovieDetails);
router.get("/:id/cast", getMovieCredits);

export default router;
