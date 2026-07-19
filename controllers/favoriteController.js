const Favorite = require("../models/Favorite");

exports.getFavorites = async (request, response) => {
  try {
    const favorites = await Favorite.find({ user: request.user._id }).sort(
      "-createdAt",
    );
    response.json({ success: true, data: favorites });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.addFavorite = async (request, response) => {
  try {
    const { movieSlug, movieName, movieThumb, movieYear } = request.body;
    const exists = await Favorite.findOne({
      user: request.user._id,
      movieSlug,
    });
    if (exists) {
      return response.status(400).json({
        success: false,
        message: "Phim đã có trong danh sách yêu thích",
      });
    }
    const favorite = await Favorite.create({
      user: request.user._id,
      movieSlug,
      movieName,
      movieThumb,
      movieYear,
    });
    response.status(201).json({ success: true, data: favorite });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFavorite = async (request, response) => {
  try {
    const result = await Favorite.findOneAndDelete({
      user: request.user._id,
      movieSlug: request.params.movieSlug,
    });
    if (!result) {
      return response.status(404).json({
        success: false,
        message: "Không tìm thấy phim trong yêu thích",
      });
    }
    response.json({ success: true, message: "Đã xóa khỏi yêu thích" });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.checkFavorite = async (request, response) => {
  try {
    const fav = await Favorite.findOne({
      user: request.user._id,
      movieSlug: request.params.movieSlug,
    });
    response.json({ success: true, data: { isFavorite: !!fav } });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
