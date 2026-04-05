import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getMyLists,
  getUserLists,
  getList,
  createList,
  updateList,
  deleteList,
  addMovieToList,
  removeMovieFromList
} from "../controllers/listController.js";

const router = express.Router();

router.get("/user/:userId", getUserLists);
router.get("/:id", getList); // Can be public
router.get("/me/all", authMiddleware, getMyLists); // 'all' avoids conflict with /:id

router.post("/", authMiddleware, createList);
router.put("/:id", authMiddleware, updateList);
router.delete("/:id", authMiddleware, deleteList);
router.post("/:id/movies", authMiddleware, addMovieToList);
router.delete("/:id/movies/:movieId", authMiddleware, removeMovieFromList);

export default router;
