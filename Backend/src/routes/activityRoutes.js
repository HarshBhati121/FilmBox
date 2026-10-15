import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getFeed, getUserActivity, getRecentActivity } from "../controllers/activityController.js";

const router = express.Router();

router.get("/recent", getRecentActivity);
router.get("/feed", authMiddleware, getFeed);
router.get("/user/:userId", getUserActivity);

export default router;
