import List from "../models/List.js";
import Activity from "../models/Activity.js";

export const getMyLists = async (req, res) => {
  try {
    const lists = await List.find({ userId: req.userId }).sort("-createdAt");
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserLists = async (req, res) => {
  try {
    const { userId } = req.params;
    const lists = await List.find({ userId, isPublic: true }).sort("-createdAt");
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id).populate("userId", "username avatar");
    if (!list) return res.status(404).json({ message: "List not found" });

    // if private and not owner
    if (!list.isPublic && list.userId._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createList = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const list = await List.create({
      userId: req.userId,
      name,
      description,
      isPublic
    });

    if (isPublic) {
      await Activity.create({
        userId: req.userId,
        type: "listed",
        listId: list._id,
      });
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateList = async (req, res) => {
  try {
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!list) return res.status(404).json({ message: "List not found" });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteList = async (req, res) => {
  try {
    const list = await List.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ message: "List not found" });
    res.json({ message: "List deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMovieToList = async (req, res) => {
  try {
    const { movieId } = req.body;
    const list = await List.findOne({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ message: "List not found" });

    if (!list.movies.includes(movieId)) {
      list.movies.push(movieId);
      await list.save();
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMovieFromList = async (req, res) => {
  try {
    const { movieId } = req.params;
    const list = await List.findOne({ _id: req.params.id, userId: req.userId });
    if (!list) return res.status(404).json({ message: "List not found" });

    list.movies = list.movies.filter(id => id.toString() !== movieId);
    await list.save();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
