const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const { protect, adminOnly } = require("../middleware/auth");
const movieService = require("../services/movieService");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const adminController = require("../controllers/adminController");
const { userCreateRules, userUpdateRules, movieCreateRules, movieUpdateRules, handleValidation } = require("../middleware/adminValidators");
const {
  reportStatusRules,
  importMovieRules,
  notificationRules,
  apiConfigRules,
  mongoIdParam,
  userRoleRules,
  slugParamRules,
  handleValidation: validate,
} = require("../middleware/validators");
let Movie;
try { Movie = require("../models/Movie"); } catch (e) { Movie = null; }

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */

router.use(protect, adminOnly);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin statistics
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/stats", adminController.getStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/users", adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     tags: [Admin]
 *     summary: Update user role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/users/:id/role", userRoleRules, validate, adminController.updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/users/:id", mongoIdParam("id"), validate, adminController.deleteUser);

/**
 * @swagger
 * /api/admin/comments/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a comment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/comments/:id", mongoIdParam("id"), validate, adminController.deleteComment);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Get all reports
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/reports", adminController.getAllReports);

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update report status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, resolved, dismissed]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/reports/:id", reportStatusRules, validate, adminController.updateReportStatus);

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/reports/:id", mongoIdParam("id"), validate, adminController.deleteReport);

/**
 * @swagger
 * /api/admin/reviews/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a review
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/reviews/:id", mongoIdParam("id"), validate, adminController.deleteReview);

/**
 * @swagger
 * /api/admin/notifications:
 *   post:
 *     tags: [Admin]
 *     summary: Send a notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/notifications", notificationRules, validate, adminController.sendNotification);

/**
 * @swagger
 * /api/admin/api-test:
 *   get:
 *     tags: [Admin]
 *     summary: Test API connection
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/api-test", adminController.testApiConnection);

/**
 * @swagger
 * /api/admin/movies/browse:
 *   get:
 *     tags: [Admin]
 *     summary: Browse movies from external API
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/movies/browse", adminController.browseAPIMovies);

/**
 * @swagger
 * /api/admin/movies/api-detail/{slug}:
 *   get:
 *     tags: [Admin]
 *     summary: Get external API movie detail
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/movies/api-detail/:slug", adminController.getAPIMovieDetail);

/**
 * @swagger
 * /api/admin/movies/categories:
 *   get:
 *     tags: [Admin]
 *     summary: Get movie categories
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/movies/categories", adminController.getAPICategories);

/**
 * @swagger
 * /api/admin/movies/countries:
 *   get:
 *     tags: [Admin]
 *     summary: Get movie countries
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/movies/countries", adminController.getAPICountries);

/**
 * @swagger
 * /api/admin/movies/local:
 *   get:
 *     tags: [Admin]
 *     summary: Get local movies
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/movies/local", adminController.getLocalMovies);

/**
 * @swagger
 * /api/admin/movies/import:
 *   post:
 *     tags: [Admin]
 *     summary: Import a movie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/movies/import", importMovieRules, validate, adminController.importMovie);

/**
 * @swagger
 * /api/admin/movies/refresh/{slug}:
 *   put:
 *     tags: [Admin]
 *     summary: Refresh movie data
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/movies/refresh/:slug", slugParamRules, validate, adminController.refreshMovie);

/**
 * @swagger
 * /api/admin/movies/featured/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Toggle featured movie
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/movies/featured/:id", mongoIdParam("id"), validate, adminController.toggleFeatured);

/**
 * @swagger
 * /api/admin/movies/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update local movie
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/movies/:id", mongoIdParam("id"), movieUpdateRules, handleValidation, adminController.updateLocalMovie);

/**
 * @swagger
 * /api/admin/movies/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete local movie
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/movies/:id", mongoIdParam("id"), validate, adminController.deleteLocalMovie);

/**
 * @swagger
 * /api/admin/import-movie:
 *   post:
 *     tags: [Admin]
 *     summary: Import phim từ API vào DB local (alias)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slug]
 *             properties:
 *               slug: { type: string }
 *     responses:
 *       200:
 *         description: Imported
 */
router.post("/import-movie", importMovieRules, validate, adminController.importMovie);

/**
 * @swagger
 * /api/admin/history:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy toàn bộ lịch sử xem phim (admin)
 *     description: Xem lịch sử khi user tạm dừng / rời trang xem phim
 *     responses:
 *       200:
 *         description: Danh sách lịch sử xem
 */
router.get("/history", adminController.getAllWatchHistory);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     tags: [Admin]
 *     summary: Tạo user mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Created
 */
router.post("/users", userCreateRules, handleValidation, async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    if (!password) return res.status(400).json({ message: "Mật khẩu bắt buộc khi tạo user" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });
    const u = new User({ name, email, role });
    u.password = password;
    await u.save();
    return res.json({ message: "Created", user: u });
  } catch (err) {
    console.error("create user error:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Cập nhật user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/users/:id", mongoIdParam("id"), validate, userUpdateRules, handleValidation, async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Not found" });
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.role) user.role = updates.role;
    if (updates.password) user.password = updates.password;
    await user.save();
    return res.json({ message: "Updated", user });
  } catch (err) {
    console.error("update user error:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/admin/api-config:
 *   post:
 *     tags: [Admin]
 *     summary: Cập nhật MOVIE_API_BASE_URL trong .env
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [movieApiBaseUrl]
 *             properties:
 *               movieApiBaseUrl: { type: string }
 *     responses:
 *       200:
 *         description: Config updated
 */
router.post("/api-config", apiConfigRules, validate, async (req, res) => {
  try {
    const { movieApiBaseUrl } = req.body;
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return res.status(500).json({ message: ".env not found" });
    const content = fs.readFileSync(envPath, "utf8");
    const replaced = content.match(/^MOVIE_API_BASE_URL=/m)
      ? content.replace(/^MOVIE_API_BASE_URL=.*$/m, `MOVIE_API_BASE_URL=${movieApiBaseUrl}`)
      : content + `\nMOVIE_API_BASE_URL=${movieApiBaseUrl}\n`;
    fs.writeFileSync(envPath, replaced, "utf8");
    return res.json({ message: "Config updated. Restart server to apply." });
  } catch (err) {
    console.error("api-config error:", err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
