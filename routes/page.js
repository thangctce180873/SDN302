const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const movieService = require("../services/movieService");
const User = require("../models/User");
const Favorite = require("../models/Favorite");
const Watchlist = require("../models/Watchlist");
const WatchHistory = require("../models/WatchHistory");
const Comment = require("../models/Comment");
const Rating = require("../models/Rating");
const Review = require("../models/Review");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");

router.get("/", async (request, response) => {
  try {
    const [
      newMovies,
      theaterMovies,
      singleMovies,
      seriesMovies,
      cartoonMovies,
    ] = await Promise.all([
      movieService.getNewMovies(1),
      movieService.getTheaterMovies(1),
      movieService.getMovieList("phim-le", { limit: 12 }),
      movieService.getMovieList("phim-bo", { limit: 12 }),
      movieService.getMovieList("hoat-hinh", { limit: 12 }),
    ]);
    const items = newMovies.items || [];
    const theaterItems = theaterMovies.items || [];
    const singleItems = singleMovies.data?.items || [];
    const seriesItems = seriesMovies.data?.items || [];

    const heroSlugs = theaterItems.slice(0, 9).map((m) => m.slug);

    const heroDetails = await Promise.all(
      heroSlugs.map(async (slug) => {
        try {
          const movieDetailResponse = await movieService.getMovieDetail(slug);
          return movieDetailResponse.movie || null;
        } catch (error) {
          return null;
        }
      }),
    );
    const heroMovies = heroDetails.filter(Boolean);

    response.render("pages/home", {
      title: "Trang Chủ",
      newMovies: items,
      heroMovies,
      theaterMovies: theaterItems.slice(0, 12),
      singleMovies: singleItems,
      seriesMovies: seriesItems,
      cartoonMovies: cartoonMovies.data?.items || [],
    });
  } catch (error) {
    console.error("Home error:", error.message);
    response.render("pages/home", {
      title: "Trang Chủ",
      newMovies: [],
      heroMovies: [],
      singleMovies: [],
      seriesMovies: [],
      cartoonMovies: [],
    });
  }
});
router.get("/register", (request, response) => {
  if (response.locals.user) return response.redirect("/");
  response.render("pages/register", { title: "Đăng Ký" });
});

router.get("/login", (request, response) => {
  if (response.locals.user) return response.redirect("/");
  response.render("pages/login", { title: "Đăng Nhập" });
});

router.get("/movie/:slug", async (request, response) => {
  try {
    const movie = await movieService.getMovieDetail(request.params.slug);
    let isFavorite = false;
    if (response.locals.user) {
      isFavorite = !!(await Favorite.findOne({
        user: response.locals.user._id,
        movieSlug: request.params.slug,
      }));
    }
    const comments = await Comment.find({ movieSlug: request.params.slug })
      .populate("user", "name avatar")
      .sort("-createdAt");
    response.render("pages/movie-detail", {
      title: movie.movie?.name || "Chi tiết phim",
      movie: movie.movie,
      episodes: movie.episodes || [],
      isFavorite,
      comments,
    });
  } catch (error) {
    console.error("Movie detail error:", error.message);
    response.redirect("/");
  }
});

router.get("/watch/:slug", async (request, response) => {
  try {
    const movieDetailResponse = await movieService.getMovieDetail(
      request.params.slug,
    );
    const episodeIndex = parseInt(request.query.ep) || 0;
    const serverIndex = parseInt(request.query.server) || 0;
    const episodes = movieDetailResponse.episodes || [];
    const serverData = episodes[serverIndex]?.server_data || [];
    const currentEpisode = serverData[episodeIndex] || serverData[0] || null;

    let relatedMovies = [];

    try {
      const catSlug = movieDetailResponse.movie?.category?.[0]?.slug;

      if (catSlug) {
        const relatedMoviesResponse = await movieService.getCategoryMovies(
          catSlug,
          {
            page: 1,
            limit: 13,
          },
        );
        relatedMovies = (relatedMoviesResponse.data?.items || [])
          .filter((m) => m.slug !== request.params.slug)
          .slice(0, 12);
      }
    } catch (error) {}

    response.render("pages/watch", {
      title: `Xem ${movie.movie?.name || "Phim"}`,
      movie: movie.movie,
      episodes,
      serverData,
      currentEpisode,
      currentEpIndex: epIndex,
      relatedMovies,
    });
  } catch (error) {
    console.error("Watch error:", error.message);
    response.redirect("/");
  }
});

router.get("/search", async (request, response) => {
  const { keyword, page = 1 } = request.query;

  let movies = [];
  let pagination = {};

  if (keyword) {
    try {
      const data = await movieService.searchMovies({
        keyword,
        page,
        limit: 24,
      });
      movies = data.data?.items || [];
      pagination = data.data?.params?.pagination || {};
    } catch (error) {
      console.error("Search error:", error.message);
    }
  }
  response.render("pages/search", {
    title: keyword ? `Tìm: ${keyword}` : "Tìm Kiếm",
    keyword: keyword || "",
    movies,
    pagination,
    currentPage: parseInt(page),
  });
});

router.get("/category/:slug", async (request, response) => {
  const { page = 1 } = request.query;

  try {
    const data = await movieService.getCategoryMovies(request.params.slug, {
      page,
      limit: 24,
    });
    response.render("pages/category", {
      title: data.data?.titlePage || "Thể Loại",
      movies: data.data?.items || [],
      pagination: data.data?.params?.pagination || {},
      currentPage: parseInt(page),
      slug: request.params.slug,
      sectionTitle: data.data?.titlePage || "",
    });
  } catch (error) {
    response.redirect("/");
  }
});

router.get("/country/:slug", async (request, response) => {
  const { page = 1 } = request.query;

  try {
    const data = await movieService.getCountryMovies(request.params.slug, {
      page,
      limit: 24,
    });
    response.render("pages/category", {
      title: data.data?.titlePage || "Quốc Gia",
      movies: data.data?.items || [],
      pagination: data.data?.params?.pagination || {},
      currentPage: parseInt(page),
      slug: request.params.slug,
      sectionTitle: data.data?.titlePage || "",
    });
  } catch (error) {
    response.redirect("/");
  }
});

router.get("/list/:type", async (request, response) => {
  const { page = 1 } = request.query;

  try {
    const data = await movieService.getMovieList(request.params.type, {
      page,
      limit: 24,
    });
    response.render("pages/category", {
      title: data.data?.titlePage || request.params.type,
      movies: data.data?.items || [],
      pagination: data.data?.params?.pagination || {},
      currentPage: parseInt(page),
      slug: request.params.type,
      sectionTitle: data.data?.titlePage || request.params.type,
    });
  } catch (error) {
    response.redirect("/");
  }
});

router.get("/profile", protect, (request, response) => {
  response.render("pages/profile", { title: "Tài Khoản" });
});

router.get("/favorites", protect, async (request, response) => {
  const favorites = await Favorite.find({ user: request.user._id }).sort(
    "-createdAt",
  );
  response.render("pages/favorites", { title: "Phim Yêu Thích", favorites });
});

router.get("/watchlist", protect, async (request, response) => {
  const watchlist = await Watchlist.find({ user: request.user._id }).sort(
    "-createdAt",
  );
  response.render("pages/watchlist", { title: "Danh Sách Xem Sau", watchlist });
});

router.get("/watchhistory", protect, async (request, response) => {
  const watchHistory = await WatchHistory.find({ user: request.user._id })
    .sort("-watchedAt")
    .limit(100);
  response.render("pages/history", { title: "Lịch Sử Xem", watchHistory });
});

router.get("/notifications", protect, async (request, response) => {
  const notifications = await Notification.find({
    $or: [{ user: request.user._id }, { type: "broadcast" }],
  })
    .sort("-createdAt")
    .limit(50);
  await Notification.updateMany(
    { $or: [{ user: request.user._id }, { type: "broadcast" }], read: false },
    { read: true },
  );
  response.render("pages/notifications", { title: "Thông Báo", notifications });
});

router.get("/admin", protect, adminOnly, async (request, response) => {
  const [userCount, commentCount, favoriteCount, adminCount] =
    await Promise.all([
      User.countDocuments(),
      Comment.countDocuments(),
      Favorite.countDocuments(),
      User.countDocuments({ role: "admin" }),
    ]);
  const recentUsers = await User.find().sort("-createdAt").limit(8);
  const recentComments = await Comment.find()
    .populate("user", "name")
    .sort("-createdAt")
    .limit(6);
  const topFavorites = await Favorite.aggregate([
    {
      $group: {
        _id: "$movieSlug",
        movieName: { $first: "$movieName" },
        movieThumb: { $first: "$movieThumb" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
  response.render("pages/admin/dashboard", {
    layout: "layouts/admin",
    title: "Admin Dashboard",
    stats: { userCount, commentCount, favoriteCount, adminCount },
    recentUsers,
    recentComments,
    topFavorites,
    adminPage: "dashboard",
  });
});

router.get("/admin/movies", protect, adminOnly, async (request, response) => {
  const Movie = require("../models/Movie");
  const { tab = "browse", type = "", keyword = "", page = 1 } = request.query;

  let movies = [],
    pagination = {},
    localCount = 0;

  try {
    localCount = await Movie.countDocuments();

    if (tab === "local") {
      const query = keyword
        ? {
            $or: [
              { name: new RegExp(keyword, "i") },
              { origin_name: new RegExp(keyword, "i") },
              { slug: new RegExp(keyword, "i") },
            ],
          }
        : {};
      const limit = 20;
      const total = await Movie.countDocuments(query);
      movies = await Movie.find(query)
        .sort("-updatedAt")
        .skip((parseInt(page) - 1) * limit)
        .limit(limit);
      pagination = {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalItemsPerPage: limit,
      };
    } else {
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
    }
  } catch (error) {
    console.error("Admin movies error:", error.message);
  }

  let categories = [],
    countries = [];

  try {
    const [cats, ctrs] = await Promise.all([
      movieService.getCategories(),
      movieService.getCountries(),
    ]);
    categories = cats || [];
    countries = ctrs || [];
  } catch (error) {}

  response.render("pages/admin/movies", {
    layout: "layouts/admin",
    title: "Quản Lý Phim",
    adminPage: "movies",
    tab,
    type,
    keyword,
    movies,
    pagination,
    currentPage: parseInt(page),
    localCount,
    categories,
    countries,
  });
});

router.get("/admin/users", protect, adminOnly, async (request, response) => {
  const users = await User.find().sort("-createdAt");
  const userStats = await Promise.all(
    users.map(async (u) => {
      const [comments, favorites] = await Promise.all([
        Comment.countDocuments({ user: u._id }),
        Favorite.countDocuments({ user: u._id }),
      ]);
      return {
        ...u.toObject(),
        commentCount: comments,
        favoriteCount: favorites,
      };
    }),
  );
  response.render("pages/admin/users", {
    layout: "layouts/admin",
    title: "Quản Lý Users",
    users: userStats,
    adminPage: "users",
  });
});

router.get("/admin/comments", protect, adminOnly, async (request, response) => {
  const comments = await Comment.find()
    .populate("user", "name email")
    .sort("-createdAt");
  response.render("pages/admin/comments", {
    layout: "layouts/admin",
    title: "Quản Lý Bình Luận",
    comments,
    adminPage: "comments",
  });
});

router.get(
  "/admin/favorites",
  protect,
  adminOnly,
  async (request, response) => {
    const topMovies = await Favorite.aggregate([
      {
        $group: {
          _id: "$movieSlug",
          movieName: { $first: "$movieName" },
          movieThumb: { $first: "$movieThumb" },
          movieYear: { $first: "$movieYear" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    const recentFavorites = await Favorite.find()
      .populate("user", "name")
      .sort("-createdAt")
      .limit(20);
    response.render("pages/admin/favorites", {
      layout: "layouts/admin",
      title: "Thống Kê Yêu Thích",
      topMovies,
      recentFavorites,
      adminPage: "favorites",
    });
  },
);

router.get(
  "/admin/api-config",
  protect,
  adminOnly,
  async (request, response) => {
    response.render("pages/admin/api-config", {
      layout: "layouts/admin",
      title: "Cấu Hình API",
      apiUrl: process.env.MOVIE_API_BASE_URL || "https://phimapi.com",
      adminPage: "api-config",
    });
  },
);

router.get("/admin/reports", protect, adminOnly, async (request, response) => {
  const reports = await Report.find()
    .populate("user", "name email")
    .sort("-createdAt");
  response.render("pages/admin/reports", {
    layout: "layouts/admin",
    title: "Báo Cáo",
    reports,
    adminPage: "reports",
  });
});

router.get("/admin/reviews", protect, adminOnly, async (request, response) => {
  const reviews = await Review.find()
    .populate("user", "name email")
    .sort("-createdAt");
  response.render("pages/admin/reviews", {
    layout: "layouts/admin",
    title: "Quản Lý Reviews",
    reviews,
    adminPage: "reviews",
  });
});

router.get(
  "/admin/notifications",
  protect,
  adminOnly,
  async (request, response) => {
    const notifs = await Notification.find().sort("-createdAt").limit(50);
    response.render("pages/admin/notifications", {
      layout: "layouts/admin",
      title: "Thông Báo",
      notifs,
      adminPage: "notifications",
    });
  },
);

router.get("/admin/activity", protect, adminOnly, async (request, response) => {
  const logs = await ActivityLog.find()
    .populate("user", "name")
    .sort("-createdAt")
    .limit(100);
  response.render("pages/admin/activity", {
    layout: "layouts/admin",
    title: "Activity Log",
    logs,
    adminPage: "activity",
  });
});

module.exports = router;
