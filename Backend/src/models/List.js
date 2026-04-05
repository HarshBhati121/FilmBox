import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    movies: [{
      type: Number // TMDB movie IDs
    }],
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("List", listSchema);
