import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["rated", "reviewed", "watchlisted", "watched", "followed", "listed"],
      required: true
    },
    // The subject of the activity (a movie, another user, or a list)
    movieId: { type: Number },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: "List" },
    // E.g., for 'rated', meta = "4.5". For 'reviewed', maybe a snippet
    meta: { type: String, default: "" }
  },
  { timestamps: true }
);

// Indexes to fetch feeds quickly
activitySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
