import express from "express";
import { searchTv, getTrendingTv, getTvDetails } from "../controllers/movieController.js";

const router = express.Router();

router.get("/search", searchTv);
router.get("/trending", getTrendingTv);
router.get("/:id", getTvDetails);

export default router;
