import Activity from "../models/Activity.js";
import User from "../models/User.js";
import { tmdbGet } from "../config/tmdb.js";
import { resolveAvatar } from "../utils/avatar.js";

const FILM_ACTIVITY_TYPES = ["watched", "reviewed", "rated"];

async function enrichWithMovieTitles(activities) {
  const movieIds = [...new Set(
    activities.filter((a) => a.movieId).map((a) => a.movieId)
  )];

  const titleMap = {};
  await Promise.all(
    movieIds.map(async (id) => {
      try {
        const movie = await tmdbGet(`/movie/${id}`);
        titleMap[id] = movie.title;
      } catch {
        titleMap[id] = null;
      }
    })
  );

  return activities.map((activity) => {
    const doc = activity.toObject ? activity.toObject() : { ...activity };
    doc.movieTitle = doc.movieId ? titleMap[doc.movieId] || `Film #${doc.movieId}` : null;
    return doc;
  });
}

async function enrichUserAvatars(activities) {
  return Promise.all(
    activities.map(async (activity) => {
      if (activity.userId?.username) {
        activity.userId.avatar = await resolveAvatar(
          activity.userId.username,
          activity.userId.avatar
        );
      }
      return activity;
    })
  );
}

export const getFeed = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 30;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const feed = await Activity.find({
      userId: { $in: currentUser.following },
      type: { $in: FILM_ACTIVITY_TYPES },
      movieId: { $exists: true, $ne: null }
    })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("userId", "username avatar");

    let enriched = await enrichWithMovieTitles(feed);
    enriched = await enrichUserAvatars(enriched);

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const activity = await Activity.find({
      userId,
      type: { $in: FILM_ACTIVITY_TYPES },
      movieId: { $exists: true, $ne: null }
    })
      .sort("-createdAt")
      .limit(20)
      .populate("userId", "username avatar");

    let enriched = await enrichWithMovieTitles(activity);
    enriched = await enrichUserAvatars(enriched);

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const activity = await Activity.find({
      type: { $in: FILM_ACTIVITY_TYPES },
      movieId: { $exists: true, $ne: null }
    })
      .sort("-createdAt")
      .limit(12)
      .populate("userId", "username avatar");

    let enriched = await enrichWithMovieTitles(activity);
    enriched = await enrichUserAvatars(enriched);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
