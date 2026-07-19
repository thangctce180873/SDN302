const Review = require("../models/Review");

exports.getReviews = async (request, response) => {
  try {
    const reviews = await Review.find({ movieSlug: request.params.movieSlug })
      .populate("user", "name avatar")
      .sort("-createdAt");
    response.json({ success: true, data: reviews });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.createReview = async (request, response) => {
  try {
    const { title, content, score, movieName } = request.body;
    const exists = await Review.findOne({
      user: request.user._id,
      movieSlug: request.params.movieSlug,
    });
    if (exists)
      return response
        .status(400)
        .json({ success: false, message: "Bạn đã viết review cho phim này" });
    const review = await Review.create({
      user: request.user._id,
      movieSlug: request.params.movieSlug,
      movieName,
      title,
      content,
      score,
    });
    response.json({ success: true, data: review });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.likeReview = async (request, response) => {
  try {
    const review = await Review.findById(request.params.id);
    if (!review)
      return response
        .status(404)
        .json({ success: false, message: "Review không tồn tại" });
    const idx = review.likes.indexOf(request.user._id);
    if (idx > -1) {
      review.likes.splice(idx, 1);
    } else {
      review.likes.push(request.user._id);
    }
    await review.save();
    response.json({
      success: true,
      likes: review.likes.length,
      liked: idx === -1,
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (request, response) => {
  try {
    const review = await Review.findById(request.params.id);
    if (!review)
      return response
        .status(404)
        .json({ success: false, message: "Review không tồn tại" });
    if (
      review.user.toString() !== request.user._id.toString() &&
      request.user.role !== "admin"
    ) {
      return response
        .status(403)
        .json({ success: false, message: "Không có quyền" });
    }
    await review.deleteOne();
    response.json({ success: true });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
