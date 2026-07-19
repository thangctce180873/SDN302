const Rating = require("../models/Rating");

exports.rateMovie = async (request, response) => {
  try {
    const { score } = request.body;
    if (!score || score < 1 || score > 5) {
      return response
        .status(400)
        .json({ success: false, message: "Điểm từ 1-5" });
    }
    const rating = await Rating.findOneAndUpdate(
      { user: request.user._id, movieSlug: request.params.movieSlug },
      { score },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const stats = await Rating.aggregate([
      { $match: { movieSlug: request.params.movieSlug } },
      { $group: { _id: null, avg: { $avg: "$score" }, count: { $sum: 1 } } },
    ]);
    response.json({
      success: true,
      data: {
        userScore: rating.score,
        avgScore: stats[0]?.avg ? Math.round(stats[0].avg * 10) / 10 : score,
        totalRatings: stats[0]?.count || 1,
      },
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getMovieRating = async (request, response) => {
  try {
    const stats = await Rating.aggregate([
      { $match: { movieSlug: request.params.movieSlug } },
      { $group: { _id: null, avg: { $avg: "$score" }, count: { $sum: 1 } } },
    ]);
    let userScore = null;
    if (request.user) {
      const r = await Rating.findOne({
        user: request.user._id,
        movieSlug: request.params.movieSlug,
      });
      if (r) userScore = r.score;
    }
    response.json({
      success: true,
      data: {
        avgScore: stats[0]?.avg ? Math.round(stats[0].avg * 10) / 10 : 0,
        totalRatings: stats[0]?.count || 0,
        userScore,
      },
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
