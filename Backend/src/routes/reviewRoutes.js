import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createReview,
  getMovieReviews,
  getUserReviews,
  deleteReview,
  likeReview,
  addComment,
  deleteComment
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/movie/:movieId", getMovieReviews);
router.get("/user/:userId", getUserReviews);

router.post("/", authMiddleware, createReview);
router.delete("/:id", authMiddleware, deleteReview);
router.post("/:id/like", authMiddleware, likeReview);
router.post("/:id/comment", authMiddleware, addComment);
router.delete("/:id/comment/:commentId", authMiddleware, deleteComment);

export default router;
