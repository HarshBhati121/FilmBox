import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
  getMe, 
  updateMe,
  getProfile,
  searchUsers,
  followUser,
  unfollowUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/search", searchUsers);
router.get("/profile/:username", getProfile);

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

router.post("/:id/follow", authMiddleware, followUser);
router.post("/:id/unfollow", authMiddleware, unfollowUser);

export default router;
