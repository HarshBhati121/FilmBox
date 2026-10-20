import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import recommendationRateLimit from "../middleware/recommendationRateLimit.js";
import { getRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

router.post("/", authMiddleware, recommendationRateLimit, getRecommendations);

export default router;
