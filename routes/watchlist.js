const router = require("express").Router();
const watchlistController = require("../controllers/watchlistController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Watchlist
 *   description: Watchlist endpoints
 */

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới

/**
 * @swagger
 * /api/watchlist:
 *   get:
 *     tags: [Watchlist]
 *     summary: Get current user's watchlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watchlist items
 */
router.get("/", watchlistController.getWatchlist);

/**
 * @swagger
 * /api/watchlist:
 *   post:
 *     tags: [Watchlist]
 *     summary: Add a movie to watchlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieSlug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie added to watchlist
 */
router.post("/", watchlistController.addToWatchlist);

/**
 * @swagger
 * /api/watchlist/check/{movieSlug}:
 *   get:
 *     tags: [Watchlist]
 *     summary: Check if a movie is in watchlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Watchlist check result
 */
router.get("/check/:movieSlug", watchlistController.checkWatchlist);

/**
 * @swagger
 * /api/watchlist/{movieSlug}:
 *   delete:
 *     tags: [Watchlist]
 *     summary: Remove a movie from watchlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie removed from watchlist
 */
router.delete("/:movieSlug", watchlistController.removeFromWatchlist);

module.exports = router;
