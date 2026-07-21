const router = require("express").Router();
const watchHistoryController = require("../controllers/watchHistoryController");
const { protect } = require("../middleware/auth");
const { watchHistoryRules, handleValidation, mongoIdParam } = require("../middleware/validators");

/**
 * @swagger
 * tags:
 *   name: WatchHistory
 *   description: Watch history endpoints
 */

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới

/**
 * @swagger
 * /api/history:
 *   get:
 *     tags: [WatchHistory]
 *     summary: Get current user's watch history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watch history list
 */
router.get("/", watchHistoryController.getHistory);

/**
 * @swagger
 * /api/history:
 *   post:
 *     tags: [WatchHistory]
 *     summary: Add a movie to watch history
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
 *               movieName:
 *                 type: string
 *               movieThumb:
 *                 type: string
 *               episodeName:
 *                 type: string
 *               episodeIndex:
 *                 type: integer
 *               serverIndex:
 *                 type: integer
 *               progress:
 *                 type: number
 *               duration:
 *                 type: number
 *               eventType:
 *                 type: string
 *                 enum: [start, pause, leave, interval, update]
 *     responses:
 *       201:
 *         description: Watch history item added
 */
router.post("/", watchHistoryRules, handleValidation, watchHistoryController.addHistory);

/**
 * @swagger
 * /api/history:
 *   delete:
 *     tags: [WatchHistory]
 *     summary: Clear current user's watch history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watch history cleared
 */
router.delete("/", watchHistoryController.clearHistory);

/**
 * @swagger
 * /api/history/{id}:
 *   delete:
 *     tags: [WatchHistory]
 *     summary: Delete one watch history item
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
 *         description: Watch history item deleted
 */
router.delete("/:id", mongoIdParam("id"), handleValidation, watchHistoryController.deleteOne);

module.exports = router;
