import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import listRoutes from "./routes/listRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import tvRoutes from "./routes/tvRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

const app = express();

app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://film-box-ruby.vercel.app",
      ...(process.env.FRONTEND_URL || "")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    ];
    const isVercelPreview =
      /^https:\/\/film-[a-z0-9]+-harshbhati-projects\.vercel\.app$/.test(origin || "");

    callback(null, !origin || allowedOrigins.includes(origin) || isVercelPreview);
  },
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("FilmBox API");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/tv", tvRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/recommendations", recommendationRoutes);

export default app;
