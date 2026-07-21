const router = require("express").Router();
const fs = require("fs");
const path = require("path");
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

let Movie;
try {
  Movie = require("../models/Movie");
} catch (error) {
  Movie = null;
}

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
    response.render("pages/detail", {
      title: movie.movie?.name || "Chi tiết phim",
      movie: movie.movie,
      episodes: movie.episodes || [],
      isFavorite,
      comments,
      user: response.locals.user,
    });
  } catch (error) {
    console.error("Movie detail error:", error.message);
    response.status(404).render("pages/error", {
      title: "Không tìm thấy phim",
      message: "Phim không tồn tại hoặc API phim đang lỗi. Vui lòng thử lại sau.",
    });
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
          { page: 1, limit: 13 },
        );
        relatedMovies = (relatedMoviesResponse.data?.items || [])
          .filter((m) => m.slug !== request.params.slug)
          .slice(0, 12);
      }
    } catch (error) {}

    response.render("pages/watch", {
      title: `Xem ${movieDetailResponse.movie?.name || "Phim"}`,
      movie: movieDetailResponse.movie,
      episodes,
      serverData,
      currentEpisode,
      currentEpIndex: episodeIndex,
      serverIndex,
      relatedMovies,
      user: response.locals.user,
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
  const notifs = await Notification.find({
    $or: [{ user: request.user._id }, { type: "broadcast" }],
  })
    .sort("-createdAt")
    .limit(50);

  await Notification.updateMany(
    { $or: [{ user: request.user._id }, { type: "broadcast" }], read: false },
    { read: true },
  );

  response.render("pages/notifications", {
    title: "Thông Báo",
    notifs,
  });
});

router.get("/admin", protect, adminOnly, async (request, response) => {
  try {
    response.render("pages/admin/dashboard", {
      layout: "layouts/admin",
      title: "Admin Dashboard",
      user: request.user || null,
      adminPage: "dashboard",
    });
  } catch (err) {
    console.error("Admin page render error:", err);
    response.status(500).render("pages/error", { message: "Đã xảy ra lỗi server" });
  }
});

router.get("/admin/:page?", protect, adminOnly, async (req, res) => {
  try {
    const page = req.params.page || "dashboard";
    const safePage = page.replace(/[^a-zA-Z0-9_-]/g, "");
    const viewFile = path.join(
      __dirname,
      "..",
      "views",
      "pages",
      "admin",
      `${safePage}.ejs`,
    );

    if (!fs.existsSync(viewFile)) {
      return res.status(404).render("pages/error", {
        title: "Không tìm thấy trang",
        message: "Trang quản trị không tồn tại",
      });
    }

    const context = {
      layout: "layouts/admin",
      title: safePage === "dashboard" ? "Dashboard" : safePage,
      user: req.user || null,
      adminPage: safePage,
    };

    switch (safePage) {
      case "dashboard":
        break;

      case "movies": {
        try {
          const pageNo = parseInt(req.query.page || "1");
          const limit = 20;
          const tab = req.query.tab || "browse";
          const keyword = (req.query.keyword || "").trim();

          context.tab = tab;
          context.keyword = keyword;
          context.type = req.query.type || "";

          const total = Movie ? await Movie.countDocuments() : 0;
          context.localCount = total;

          if (tab === "browse") {
            let apiData;
            const typeSlug = (req.query.type || "").trim();
            if (keyword) {
              apiData = await movieService.searchMovies({
                keyword,
                page: pageNo,
                limit,
              });
              context.movies = apiData.data?.items || [];
              context.pagination = {
                totalItems: apiData.data?.params?.pagination?.totalItems || context.movies.length,
                currentPage: pageNo,
                totalPages: apiData.data?.params?.pagination?.totalPages || 1,
              };
            } else if (typeSlug) {
              apiData = await movieService.getCategoryMovies(typeSlug, { page: pageNo, limit });
              context.movies = apiData.data?.items || [];
              context.pagination = {
                totalItems: apiData.data?.params?.pagination?.totalItems || context.movies.length,
                currentPage: pageNo,
                totalPages: apiData.data?.params?.pagination?.totalPages || 1,
              };
            } else {
              apiData = await movieService.getNewMovies(pageNo);
              context.movies = apiData.items || apiData.data?.items || [];
              context.pagination = {
                totalItems: apiData.pagination?.totalItems || context.movies.length,
                currentPage: pageNo,
                totalPages: apiData.pagination?.totalPages || 1,
              };
            }
          } else {
            const movies = Movie
              ? await Movie.find()
                  .sort("-updatedAt")
                  .skip((pageNo - 1) * limit)
                  .limit(limit)
              : [];
            context.movies = movies || [];
            context.pagination = {
              totalItems: total,
              currentPage: pageNo,
              totalPages: Math.ceil(total / limit) || 1,
            };
          }

          try {
            const [cats, ctrs] = await Promise.all([
              movieService.getCategories(),
              movieService.getCountries(),
            ]);
            context.categories = movieService.extractItems(cats);
            context.countries = movieService.extractItems(ctrs);
          } catch (err) {
            context.categories = [];
            context.countries = [];
          }
        } catch (error) {
          console.error("Admin movies error:", error.message);
          context.movies = [];
          context.pagination = { currentPage: 1, totalPages: 1 };
          context.localCount = 0;
          context.tab = req.query.tab || "browse";
          context.keyword = req.query.keyword || "";
        }
        break;
      }

      case "users": {
        try {
          const users = await User.find().sort("-createdAt");
          context.users = users || [];
        } catch (error) {
          context.users = [];
        }
        break;
      }

      case "comments": {
        try {
          const comments = await Comment.find()
            .populate("user", "name email")
            .sort("-createdAt");
          context.comments = comments || [];
        } catch (error) {
          context.comments = [];
        }
        break;
      }

      case "reviews": {
        try {
          const reviews = await Review.find()
            .populate("user", "name email")
            .sort("-createdAt");
          context.reviews = reviews || [];
        } catch (error) {
          context.reviews = [];
        }
        break;
      }

      case "favorites": {
        try {
          const totalFavorites = await Favorite.countDocuments();
          const topMovies = await Favorite.aggregate([
            {
              $group: {
                _id: "$movieSlug",
                movieName: { $first: "$movieName" },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 50 },
          ]);
          const recentFavorites = await Favorite.find()
            .populate("user", "name email")
            .sort("-createdAt")
            .limit(20);
          context.topMovies = topMovies || [];
          context.recentFavorites = recentFavorites || [];
          context.totalFavorites = totalFavorites;
        } catch (error) {
          context.topMovies = [];
          context.recentFavorites = [];
          context.totalFavorites = 0;
        }
        break;
      }

      case "categories": {
        try {
          const [cats, ctrs] = await Promise.all([
            movieService.getCategories(),
            movieService.getCountries(),
          ]);
          context.categories = movieService.extractItems(cats);
          context.countries = movieService.extractItems(ctrs);
        } catch (error) {
          context.categories = [];
          context.countries = [];
        }
        break;
      }

      case "history": {
        try {
          const histories = await WatchHistory.find()
            .populate("user", "name email")
            .sort("-watchedAt")
            .limit(200);
          context.histories = histories || [];
        } catch (error) {
          context.histories = [];
        }
        break;
      }

      case "reports": {
        try {
          const reports = await Report.find()
            .populate("user", "name email")
            .sort("-createdAt");
          context.reports = reports || [];
        } catch (error) {
          context.reports = [];
        }
        break;
      }

      case "notifications": {
        try {
          const notifs = await Notification.find().sort("-createdAt").limit(50);
          context.notifs = notifs || [];
        } catch (error) {
          context.notifs = [];
        }
        break;
      }

      case "activity": {
        try {
          const logs = await ActivityLog.find()
            .populate("user", "name")
            .sort("-createdAt")
            .limit(100);
          context.logs = logs || [];
        } catch (error) {
          context.logs = [];
        }
        break;
      }

      case "api-config": {
        context.apiUrl = process.env.MOVIE_API_BASE_URL || "https://phimapi.com";
        break;
      }

      default:
        break;
    }

    return res.render(`pages/admin/${safePage}`, context);
  } catch (error) {
    console.error("Admin page render error:", error);
    return res.status(500).render("pages/error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi server",
    });
  }
});

module.exports = router;
