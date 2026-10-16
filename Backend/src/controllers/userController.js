import User from "../models/User.js";
import { resolveAvatar } from "../utils/avatar.js";

async function withResolvedAvatar(user) {
  if (!user) return user;
  const doc = user.toObject ? user.toObject() : { ...user };
  doc.avatar = await resolveAvatar(doc.username, doc.avatar);
  return doc;
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(await withResolvedAvatar(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(await withResolvedAvatar(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json([]);

    const users = await User.find({ username: { $regex: q.trim(), $options: "i" } })
      .select("username avatar bio _id")
      .sort({ createdAt: -1 })
      .limit(24);

    const resolved = await Promise.all(users.map((user) => withResolvedAvatar(user)));
    res.json(resolved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    if (String(req.userId) === String(req.params.id)) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = currentUser.following.some(
      (id) => String(id) === String(targetUser._id)
    );

    if (!alreadyFollowing) {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      await currentUser.save();
      await targetUser.save();

      // Log activity
      const Activity = (await import("../models/Activity.js")).default;
      await Activity.create({
        userId: req.userId,
        type: "followed",
        targetUserId: targetUser._id
      });
    }

    res.json(currentUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUser._id.toString());
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await targetUser.save();

    res.json(currentUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateMe = async (req, res) => {
  try {
    const updates = {};
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.favoriteFilms !== undefined) {
      if (!Array.isArray(req.body.favoriteFilms) || req.body.favoriteFilms.length > 4) {
        return res.status(400).json({ message: "You can only have up to 4 favorite films" });
      }
      updates.favoriteFilms = req.body.favoriteFilms
        .slice(0, 4)
        .map((id) => Number(id))
        .map((id) => (Number.isNaN(id) || id === 0 ? 0 : id));
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(await withResolvedAvatar(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatches = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me || !me.favoriteFilms || me.favoriteFilms.length === 0) {
      return res.json([]);
    }
    const myFavs = me.favoriteFilms;
    
    // Find users who share at least 1 favorite film
    const matchedUsers = await User.find({
      _id: { $ne: me._id },
      favoriteFilms: { $in: myFavs }
    }).select("username avatar bio favoriteFilms followers following");

    // Sort by match count
    matchedUsers.sort((a, b) => {
      const aMatches = a.favoriteFilms.filter(f => myFavs.includes(f)).length;
      const bMatches = b.favoriteFilms.filter(f => myFavs.includes(f)).length;
      return bMatches - aMatches;
    });

    res.json(matchedUsers.slice(0, 8)); // Return top 8 matches
  } catch(error) {
     res.status(500).json({ message: error.message });
  }
};