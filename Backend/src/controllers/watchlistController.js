import Watchlist from "../models/Watchlist.js";
import Activity from "../models/Activity.js";

export const getWatchlist = async (req, res) => {
  try {
    const list = await Watchlist.find({ userId: req.userId }).sort("-createdAt");
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMovie = async (req, res) => {
  try {
    const { movieId, status = "watchlist" } = req.body;

    let item = await Watchlist.findOne({ userId: req.userId, movieId });
    if (item) {
      item.status = status;
      await item.save();
    } else {
      item = await Watchlist.create({ userId: req.userId, movieId, status });
      await Activity.create({
        userId: req.userId,
        type: status === "watchlist" ? "watchlisted" : "watched",
        movieId
      });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { movieId } = req.params;
    const item = await Watchlist.findOne({ userId: req.userId, movieId });
    if (!item) return res.status(404).json({ message: "Not in watchlist" });

    item.status = item.status === "watchlist" ? "watched" : "watchlist";
    await item.save();

    await Activity.create({
      userId: req.userId,
      type: item.status === "watchlist" ? "watchlisted" : "watched",
      movieId
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    await Watchlist.findOneAndDelete({ userId: req.userId, movieId });
    res.json({ message: "Removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatus = async (req, res) => {
  try {
    const { movieId } = req.params;
    const item = await Watchlist.findOne({ userId: req.userId, movieId });
    res.json({ status: item ? item.status : "none" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
