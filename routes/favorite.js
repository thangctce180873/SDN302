const router = require("express").Router();
const favoriteController = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");
const { favoriteCreateRules, handleValidation } = require("../middleware/validators");

/**
 * @swagger
 * tags:
 *   name: Favorite
 *   description: Favorite movie endpoints
 */

router.use(protect); // đăng nhập mới dùng được

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     tags: [Favorite]
 *     summary: Get current user's favorite movies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite movies
 */
router.get("/", favoriteController.getFavorites);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     tags: [Favorite]
 *     summary: Add a movie to favorites
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
 *         description: Movie added to favorites
 */
router.post("/", favoriteCreateRules, handleValidation, favoriteController.addFavorite);

/**
 * @swagger
 * /api/favorites/check/{movieSlug}:
 *   get:
 *     tags: [Favorite]
 *     summary: Check if a movie is in favorites
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
 *         description: Favorite check result
 */
router.get("/check/:movieSlug", favoriteController.checkFavorite);

/**
 * @swagger
 * /api/favorites/{movieSlug}:
 *   delete:
 *     tags: [Favorite]
 *     summary: Remove a movie from favorites
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
 *         description: Movie removed from favorites
 */
router.delete("/:movieSlug", favoriteController.removeFavorite);

module.exports = router;
