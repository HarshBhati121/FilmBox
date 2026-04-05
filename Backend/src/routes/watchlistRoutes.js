import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getWatchlist,
  addMovie,
  updateStatus,
  removeMovie,
  getStatus
} from "../controllers/watchlistController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWatchlist);
router.post("/", addMovie);
router.put("/:movieId", updateStatus);
router.delete("/:movieId", removeMovie);
router.get("/status/:movieId", getStatus);

export default router;
