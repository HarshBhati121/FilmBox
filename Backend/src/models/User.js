import mongoose from "mongoose";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [emailRegex, "Please enter a valid email"]
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },
    bio: {
      type: String,
      default: "",
      maxlength: 160
    },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg"
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    favoriteFilms: {
      type: [Number],
      default: [0, 0, 0, 0],
      validate: {
        validator: (v) => v.length <= 4,
        message: "You can only have up to 4 favorite films"
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
