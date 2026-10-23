import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getFeed, getUserActivity, getRecentActivity, recordSearch } from "../controllers/activityController.js";

const router = express.Router();

router.get("/recent", getRecentActivity);
router.get("/feed", authMiddleware, getFeed);
router.post("/search", authMiddleware, recordSearch);
router.get("/user/:userId", getUserActivity);

export default router;
