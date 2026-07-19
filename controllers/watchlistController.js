const Watchlist = require("../models/Watchlist");

exports.getWatchlist = async (request, response) => {
  try {
    const list = await Watchlist.find({ user: request.user._id }).sort(
      "-createdAt",
    );
    response.json({ success: true, data: list });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWatchlist = async (request, response) => {
  try {
    const { movieSlug, movieName, movieThumb, movieYear } = request.body;
    const exists = await Watchlist.findOne({
      user: request.user._id,
      movieSlug,
    });
    if (exists)
      return response
        .status(400)
        .json({ success: false, message: "Đã có trong danh sách" });
    await Watchlist.create({
      user: request.user._id,
      movieSlug,
      movieName,
      movieThumb,
      movieYear,
    });
    response.json({ success: true });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWatchlist = async (request, response) => {
  try {
    await Watchlist.findOneAndDelete({
      user: request.user._id,
      movieSlug: request.params.movieSlug,
    });
    response.json({ success: true });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.checkWatchlist = async (request, response) => {
  try {
    const exists = await Watchlist.findOne({
      user: request.user._id,
      movieSlug: request.params.movieSlug,
    });
    response.json({ success: true, inWatchlist: !!exists });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
