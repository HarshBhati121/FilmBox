import Review from "../models/Review.js";
import Activity from "../models/Activity.js";

export const createReview = async (req, res) => {
  try {
    const { movieId, rating, reviewText } = req.body;
    let review = await Review.findOne({ userId: req.userId, movieId });

    if (review) {
      review.rating = rating;
      review.reviewText = reviewText;
      await review.save();
    } else {
      review = await Review.create({ userId: req.userId, movieId, rating, reviewText });
      
      // log activity
      await Activity.create({
        userId: req.userId,
        type: reviewText ? "reviewed" : "rated",
        movieId,
        meta: rating.toString()
      });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId }).populate("userId", "username avatar");

    // compute average
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
      : 0;

    res.json({ reviews, avgRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId }).sort("-createdAt");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const index = review.likes.indexOf(req.userId);
    if (index === -1) {
      review.likes.push(req.userId);
    } else {
      review.likes.splice(index, 1);
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.comments.push({ userId: req.userId, text });
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const commentIndex = review.comments.findIndex(c => c._id.toString() === commentId && c.userId.toString() === req.userId);
    if (commentIndex === -1) return res.status(404).json({ message: "Comment not found or unauthorized" });

    review.comments.splice(commentIndex, 1);
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
