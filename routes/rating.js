const router = require("express").Router();
const ratingController = require("../controllers/ratingController");
const { protect, optionalAuth } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Rating
 *   description: Movie rating endpoints
 */

/**
 * @swagger
 * /api/ratings/{movieSlug}:
 *   post:
 *     tags: [Rating]
 *     summary: Rate a movie
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieSlug
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
 *               rating:
 *                 type: number
 *             required:
 *               - rating
 *     responses:
 *       200:
 *         description: Movie rated successfully
 */
router.post("/:movieSlug", protect, ratingController.rateMovie);

/**
 * @swagger
 * /api/ratings/{movieSlug}:
 *   get:
 *     tags: [Rating]
 *     summary: Get rating info for a movie
 *     parameters:
 *       - in: path
 *         name: movieSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie rating details
 */
router.get("/:movieSlug", optionalAuth, ratingController.getMovieRating);

module.exports = router;
