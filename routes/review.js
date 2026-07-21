const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Movie review endpoints
 */

/**
 * @swagger
 * /api/reviews/{movieSlug}:
 *   get:
 *     tags: [Review]
 *     summary: Get reviews for a movie
 *     parameters:
 *       - in: path
 *         name: movieSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/:movieSlug", reviewController.getReviews);

module.exports = router;