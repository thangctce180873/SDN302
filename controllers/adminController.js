const User = require("../models/User");
const Movie = require("../models/Movie");
const Favorite = require("../models/Favorite");
const Watchlist = require("../models/Watchlist");
const WatchHistory = require("../models/WatchHistory");
const Comment = require("../models/Comment");
const Rating = require("../models/Rating");
const Review = require("../models/Review");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const movieService = require("../services/movieService");

// Dashboard

exports.getStats = async (_request, response) => {
  try {
    const [userCount, commentCount, favoriteCount, movieCount, reportCount] =
      await Promise.all([
        User.countDocuments(),
        Comment.countDocuments(),
        Favorite.countDocuments(),
        Movie.countDocuments(),
        Report.countDocuments({ status: "pending" }),
      ]);
    response.json({
      success: true,
      data: { userCount, commentCount, favoriteCount, movieCount, reportCount },
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

// User Management

exports.getAllUsers = async (_request, response) => {
  try {
    const users = await User.find().sort("-createdAt");
    response.json({ success: true, data: users });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserRole = async (request, response) => {
  try {
    const user = await User.findByIdAndUpdate(
      request.params.id,
      { role: request.body.role },
      { new: true, runValidators: true },
    );
    if (!user)
      return response
        .status(404)
        .json({ success: false, message: "User không tồn tại" });
    response.json({ success: true, data: user });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (request, response) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user)
      return response
        .status(404)
        .json({ success: false, message: "User không tồn tại" });
    if (user.role === "admin") {
      return response
        .status(400)
        .json({ success: false, message: "Không thể xóa admin" });
    }
    await Promise.all([
      user.deleteOne(),
      Comment.deleteMany({ user: user._id }),
      Favorite.deleteMany({ user: user._id }),
      Rating.deleteMany({ user: user._id }),
      WatchHistory.deleteMany({ user: user._id }),
      Watchlist.deleteMany({ user: user._id }),
      Review.deleteMany({ user: user._id }),
      Report.deleteMany({ user: user._id }),
    ]);
    response.json({
      success: true,
      message: "Đã xóa user và toàn bộ dữ liệu liên quan",
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

// Comment Management

exports.deleteComment = async (request, response) => {
  try {
    const comment = await Comment.findById(request.params.id);
    if (!comment)
      return response
        .status(404)
        .json({ success: false, message: "Comment không tồn tại" });
    await comment.deleteOne();
    response.json({ success: true, message: "Đã xóa bình luận" });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

// Report Management

exports.updateReportStatus = async (request, response) => {
  try {
    const report = await Report.findByIdAndUpdate(
      request.params.id,
      { status: request.body.status, adminNote: request.body.adminNote || "" },
      { new: true },
    );
    if (!report)
      return response
        .status(404)
        .json({ success: false, message: "Report không tồn tại" });
    response.json({ success: true, data: report });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllReports = async (_request, response) => {
  try {
    const reports = await Report.find()
      .populate("user", "name email")
      .sort("-createdAt");
    response.json({ success: true, data: reports });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReport = async (request, response) => {
  try {
    await Report.findByIdAndDelete(request.params.id);
    response.json({ success: true, message: "Đã xóa báo cáo" });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

// Notification

exports.sendNotification = async (request, response) => {
  try {
    const { title, message, type, userId } = request.body;
    const notification = await Notification.create({
      title,
      message,
      type: type || "broadcast",
      user: userId || null,
    });
    response.json({ success: true, data: notification });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

// Review Management

exports.deleteReview = async (request, response) => {
  try {
    const review = await Review.findById(request.params.id);
    if (!review)
      return response
        .status(404)
        .json({ success: false, message: "Review không tồn tại" });
    await review.deleteOne();
    response.json({ success: true });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

// API Connection Test

exports.testApiConnection = async (_request, response) => {
  try {
    const start = Date.now();
    const data = await movieService.getNewMovies(1);
    const latency = Date.now() - start;
    const ok = !!(data && (data.items || data.data));
    response.json({
      success: true,
      data: {
        status: ok ? "connected" : "error",
        latency,
        baseUrl: process.env.MOVIE_API_BASE_URL || "https://phimapi.com",
        sampleCount: data.items?.length || data.data?.items?.length || 0,
      },
    });
  } catch (error) {
    response.json({
      success: true,
      data: {
        status: "error",
        latency: null,
        baseUrl: process.env.MOVIE_API_BASE_URL,
        error: error.message,
      },
    });
  }
};

// Movie CRUD

exports.browseAPIMovies = async (request, response) => {
  try {
    const { type, keyword, page = 1 } = request.query;
    let movies = [],
      pagination = {};

    if (keyword) {
      const data = await movieService.searchMovies({
        keyword,
        page,
        limit: 24,
      });
      movies = data.data?.items || [];
      pagination = data.data?.params?.pagination || {};
    } else if (type) {
      const data = await movieService.getMovieList(type, { page, limit: 24 });
      movies = data.data?.items || [];
      pagination = data.data?.params?.pagination || {};
    } else {
      const data = await movieService.getNewMovies(page);
      movies = data.items || [];
      pagination = data.pagination || {};
    }

    response.json({ success: true, data: { movies, pagination } });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getAPIMovieDetail = async (request, response) => {
  try {
    const data = await movieService.getMovieDetail(request.params.slug);
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.importMovie = async (request, response) => {
  try {
    const { slug } = request.body;
    if (!slug)
      return response
        .status(400)
        .json({ success: false, message: "Thiếu slug phim" });

    const existing = await Movie.findOne({ slug });
    if (existing)
      return response
        .status(400)
        .json({ success: false, message: "Phim đã tồn tại trong CSDL" });

    const apiData = await movieService.getMovieDetail(slug);
    const m = apiData.movie;
    if (!m)
      return response
        .status(404)
        .json({ success: false, message: "Không tìm thấy phim từ API" });

    const movie = await Movie.create({
      slug: m.slug,
      name: m.name,
      origin_name: m.origin_name || "",
      thumb_url: m.thumb_url || "",
      poster_url: m.poster_url || "",
      year: m.year,
      quality: m.quality || "",
      lang: m.lang || "",
      type: m.type || "",
      status: m.status || "",
      episode_current: m.episode_current || "",
      episode_total: m.episode_total || "",
      time: m.time || "",
      content: m.content || "",
      categories: m.category || [],
      countries: m.country || [],
    });

    response.json({
      success: true,
      data: movie,
      message: "Đã import phim thành công",
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getLocalMovies = async (request, response) => {
  try {
    const { page = 1, keyword, limit = 20 } = request.query;
    const query = {};
    if (keyword) {
      query.$or = [
        { name: new RegExp(keyword, "i") },
        { origin_name: new RegExp(keyword, "i") },
        { slug: new RegExp(keyword, "i") },
      ];
    }
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort("-updatedAt")
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    response.json({
      success: true,
      data: {
        movies,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLocalMovie = async (request, response) => {
  try {
    const {
      name,
      origin_name,
      year,
      quality,
      lang,
      content,
      featured,
      isActive,
      adminNote,
    } = request.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (origin_name !== undefined) update.origin_name = origin_name;
    if (year !== undefined) update.year = year;
    if (quality !== undefined) update.quality = quality;
    if (lang !== undefined) update.lang = lang;
    if (content !== undefined) update.content = content;
    if (featured !== undefined) update.featured = featured;
    if (isActive !== undefined) update.isActive = isActive;
    if (adminNote !== undefined) update.adminNote = adminNote;

    const movie = await Movie.findByIdAndUpdate(request.params.id, update, {
      new: true,
    });
    if (!movie)
      return response
        .status(404)
        .json({ success: false, message: "Phim không tồn tại" });
    response.json({ success: true, data: movie });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLocalMovie = async (request, response) => {
  try {
    const movie = await Movie.findByIdAndDelete(request.params.id);
    if (!movie)
      return response
        .status(404)
        .json({ success: false, message: "Phim không tồn tại" });
    response.json({ success: true, message: "Đã xóa phim khỏi CSDL" });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.refreshMovie = async (request, response) => {
  try {
    const local = await Movie.findOne({ slug: request.params.slug });
    if (!local)
      return response
        .status(404)
        .json({ success: false, message: "Phim không tồn tại trong CSDL" });

    const apiData = await movieService.getMovieDetail(request.params.slug);
    const m = apiData.movie;
    if (!m)
      return response
        .status(404)
        .json({ success: false, message: "Không tìm thấy phim từ API" });

    local.name = m.name;
    local.origin_name = m.origin_name || "";
    local.thumb_url = m.thumb_url || "";
    local.poster_url = m.poster_url || "";
    local.year = m.year;
    local.quality = m.quality || "";
    local.lang = m.lang || "";
    local.type = m.type || "";
    local.status = m.status || "";
    local.episode_current = m.episode_current || "";
    local.episode_total = m.episode_total || "";
    local.time = m.time || "";
    local.content = m.content || "";
    local.categories = m.category || [];
    local.countries = m.country || [];
    await local.save();

    response.json({
      success: true,
      data: local,
      message: "Đã cập nhật dữ liệu từ API",
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleFeatured = async (request, response) => {
  try {
    const movie = await Movie.findById(request.params.id);
    if (!movie)
      return response
        .status(404)
        .json({ success: false, message: "Phim không tồn tại" });
    movie.featured = !movie.featured;
    await movie.save();
    response.json({ success: true, data: movie });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getAPICategories = async (_request, response) => {
  try {
    const data = await movieService.getCategories();
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getAPICountries = async (_request, response) => {
  try {
    const data = await movieService.getCountries();
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
