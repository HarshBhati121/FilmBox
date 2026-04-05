import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    movieId: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["watchlist", "watched"],
      default: "watchlist"
    }
  },
  { timestamps: true }
);

// A user can only have one status entry per movie
watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model("Watchlist", watchlistSchema);
