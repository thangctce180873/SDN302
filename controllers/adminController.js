const movieService = require("../services/movieService");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Report = require("../models/Report");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const WatchHistory = require("../models/WatchHistory");
const ActivityLog = require("../models/ActivityLog");

let Movie;
try { Movie = require("../models/Movie"); } catch (e) { Movie = null; }

async function logActivity(req, action, target, detail = "") {
  try {
    const ip = req.ip || req.connection?.remoteAddress || "";
    const log = new ActivityLog({
      user: req.user ? req.user._id : null,
      action,
      target,
      detail,
      ip,
    });
    await log.save();
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

module.exports = {
  getStats: async (req, res) => {
    try {
      const users = await User.countDocuments();
      const comments = await Comment.countDocuments();
      const reports = await Report.countDocuments();
      const moviesLocal = Movie ? await Movie.countDocuments() : 0;
      return res.json({ users, comments, reports, moviesLocal });
    } catch (err) {
      console.error("getStats error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().sort("-createdAt");
      return res.json({ users });
    } catch (err) {
      console.error("getAllUsers error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !["user","admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
      const u = await User.findById(req.params.id);
      if (!u) return res.status(404).json({ message: "User not found" });
      u.role = role;
      await u.save();
      await logActivity(req, "Cập nhật quyền", `Người dùng: ${u.email}`, `Vai trò mới: ${role}`);
      return res.json({ message: "Updated", user: u });
    } catch (err) {
      console.error("updateUserRole error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      await logActivity(req, "Xóa người dùng", `User ID: ${req.params.id}`);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("deleteUser error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      await Comment.findByIdAndDelete(req.params.id);
      await logActivity(req, "Xóa bình luận", `Comment ID: ${req.params.id}`);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("deleteComment error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  getAllWatchHistory: async (req, res) => {
    try {
      const history = await WatchHistory.find()
        .populate("user", "name email")
        .sort("-watchedAt")
        .limit(200);
      return res.json({ success: true, history });
    } catch (err) {
      console.error("getAllWatchHistory error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  getAllReports: async (req, res) => {
    try {
      const reports = await Report.find().populate("user", "name email").sort("-createdAt");
      return res.json({ reports });
    } catch (err) {
      console.error("getAllReports error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  updateReportStatus: async (req, res) => {
    try {
      const { status, adminNote } = req.body;
      const r = await Report.findById(req.params.id);
      if (!r) return res.status(404).json({ message: "Report not found" });
      if (status) r.status = status;
      if (adminNote !== undefined) r.adminNote = adminNote;
      await r.save();
      await logActivity(req, "Cập nhật báo cáo", `Report ID: ${r._id}`, `Trạng thái: ${status || 'Không đổi'}`);
      return res.json({ message: "Updated", report: r });
    } catch (err) {
      console.error("updateReportStatus error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  deleteReport: async (req, res) => {
    try {
      await Report.findByIdAndDelete(req.params.id);
      await logActivity(req, "Xóa báo cáo", `Report ID: ${req.params.id}`);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("deleteReport error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  deleteReview: async (req, res) => {
    try {
      await Review.findByIdAndDelete(req.params.id);
      await logActivity(req, "Xóa review", `Review ID: ${req.params.id}`);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("deleteReview error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  sendNotification: async (req, res) => {
    try {
      const { title, message, type = "broadcast", userId } = req.body;
      const n = new Notification({ title, message, type, user: type === "personal" ? userId : null });
      await n.save();
      return res.json({ message: "Sent", notif: n });
    } catch (err) {
      console.error("sendNotification error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  testApiConnection: async (req, res) => {
    try {
      const start = Date.now();
      const data = await movieService.getNewMovies(1);
      const latency = Date.now() - start;
      const ok = !!(data && (data.items || data.data));
      return res.json({ success: ok, latency, sample: data?.items?.length || data?.data?.items?.length || 0 });
    } catch (err) {
      console.error("testApiConnection error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  browseAPIMovies: async (req, res) => {
    try {
      const { type, keyword, page = 1 } = req.query;
      let data;
      if (keyword) data = await movieService.searchMovies({ keyword, page, limit: 24 });
      else if (type) data = await movieService.getMovieList(type, { page, limit: 24 });
      else data = await movieService.getNewMovies(page);
      return res.json({ data });
    } catch (err) {
      console.error("browseAPIMovies error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  getAPIMovieDetail: async (req, res) => {
    try {
      const d = await movieService.getMovieDetail(req.params.slug);
      return res.json({ data: d });
    } catch (err) {
      console.error("getAPIMovieDetail error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  getAPICategories: async (req, res) => {
    try {
      const d = await movieService.getCategories();
      return res.json({ data: movieService.extractItems(d) });
    } catch (err) {
      console.error("getAPICategories error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  getAPICountries: async (req, res) => {
    try {
      const d = await movieService.getCountries();
      return res.json({ data: movieService.extractItems(d) });
    } catch (err) {
      console.error("getAPICountries error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  getLocalMovies: async (req, res) => {
    try {
      if (!Movie) return res.status(501).json({ message: "Local Movie model missing" });
      const page = parseInt(req.query.page || "1");
      const limit = 20;
      const total = await Movie.countDocuments();
      const movies = await Movie.find().skip((page-1)*limit).limit(limit).sort("-updatedAt");
      return res.json({ movies, pagination: { total, page, totalPages: Math.ceil(total/limit) } });
    } catch (err) {
      console.error("getLocalMovies error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  importMovie: async (req, res) => {
    try {
      const { slug } = req.body;
      if (!slug) return res.status(400).json({ message: "Missing slug" });
      const apiResp = await movieService.getMovieDetail(slug);
      const mv = apiResp.movie || apiResp;
      if (!mv || !mv.slug) return res.status(404).json({ message: "Movie not found on API" });
      if (!Movie) return res.status(501).json({ message: "Local Movie model not available" });

      const exists = await Movie.findOne({ slug: mv.slug });
      if (exists) return res.json({ message: "Movie already imported", movie: exists });

      const doc = new Movie({
        name: mv.name || mv.title,
        origin_name: mv.origin_name || "",
        slug: mv.slug,
        year: mv.year || mv.release_year,
        content: mv.content || mv.description || "",
        thumb_url: mv.thumb_url || mv.thumb || mv.poster || "",
        poster_url: mv.poster_url || mv.poster || mv.thumb || "",
        categories: (mv.category || mv.categories || []).map(c =>
          typeof c === "string" ? { name: c, slug: c } : { name: c.name || c.slug, slug: c.slug || c.name }
        ),
        countries: (mv.country || mv.countries || []).map(c =>
          typeof c === "string" ? { name: c, slug: c } : { name: c.name || c.slug, slug: c.slug || c.name }
        ),
      });
      await doc.save();
      await logActivity(req, "Import phim", `Phim: ${doc.name}`);
      return res.json({ message: "Imported", movie: doc });
    } catch (err) {
      console.error("importMovie error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  refreshMovie: async (req, res) => {
    try {
      if (!Movie) return res.status(501).json({ message: "Local Movie model not available" });
      const slug = req.params.slug;
      const apiResp = await movieService.getMovieDetail(slug);
      const mv = apiResp.movie || apiResp;
      if (!mv) return res.status(404).json({ message: "Not found on API" });
      const doc = await Movie.findOneAndUpdate({ slug }, { raw: mv, name: mv.name || mv.title, thumb: mv.thumb || mv.poster }, { new: true });
      return res.json({ message: "Refreshed", movie: doc });
    } catch (err) {
      console.error("refreshMovie error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  toggleFeatured: async (req, res) => {
    try {
      if (!Movie) return res.status(501).json({ message: "Local Movie model not available" });
      const id = req.params.id;
      const mv = await Movie.findById(id);
      if (!mv) return res.status(404).json({ message: "Movie not found" });
      mv.featured = !mv.featured;
      await mv.save();
      return res.json({ message: "Toggled", featured: mv.featured });
    } catch (err) {
      console.error("toggleFeatured error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  updateLocalMovie: async (req, res) => {
    try {
      if (!Movie) return res.status(501).json({ message: "Local Movie model not available" });
      const id = req.params.id;
      const updates = req.body || {};
      const mv = await Movie.findById(id);
      if (!mv) return res.status(404).json({ message: "Movie not found" });
      Object.assign(mv, updates);
      await mv.save();
      await logActivity(req, "Cập nhật phim", `Phim: ${mv.name}`);
      return res.json({ message: "Updated", movie: mv });
    } catch (err) {
      console.error("updateLocalMovie error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  deleteLocalMovie: async (req, res) => {
    try {
      if (!Movie) return res.status(501).json({ message: "Local Movie model not available" });
      await Movie.findByIdAndDelete(req.params.id);
      await logActivity(req, "Xóa phim", `Movie ID: ${req.params.id}`);
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("deleteLocalMovie error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
};
