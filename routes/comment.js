const router = require("express").Router();
const commentController = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: Movie comment endpoints
 */

/**
 * @swagger
 * /api/comments/{movieSlug}:
 *   get:
 *     tags: [Comment]
 *     summary: Get comments for a movie
 *     parameters:
 *       - in: path
 *         name: movieSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:movieSlug", commentController.getComments);

/**
 * @swagger
 * /api/comments/{movieSlug}:
 *   post:
 *     tags: [Comment]
 *     summary: Create a new comment
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
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post("/:movieSlug", protect, commentController.createComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     tags: [Comment]
 *     summary: Update a comment
 *     security:
 *       - bearerAuth: []
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.put("/:id", protect, commentController.updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comment]
 *     summary: Delete a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete("/:id", protect, commentController.deleteComment);

module.exports = router;
