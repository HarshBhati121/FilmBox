import Activity from "../models/Activity.js";
import User from "../models/User.js";

export const getFeed = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.userId);
    // Find activity by users I follow
    const usersToFetch = [...currentUser.following, currentUser._id];

    const feed = await Activity.find({ userId: { $in: usersToFetch } })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("userId", "username avatar")
      .populate("targetUserId", "username avatar")
      .populate("listId", "name");

    res.json(feed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const activity = await Activity.find({ userId })
      .sort("-createdAt")
      .limit(20)
      .populate("userId", "username avatar")
      .populate("targetUserId", "username avatar")
      .populate("listId", "name");
      
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
