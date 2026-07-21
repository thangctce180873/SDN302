const router = require("express").Router();
const reportController = require("../controllers/reportController");
const { protect } = require("../middleware/auth");
const { reportCreateRules, handleValidation } = require("../middleware/validators");

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Báo lỗi phim
 */

/**
 * @swagger
 * /api/reports:
 *   get:
 *     tags: [Report]
 *     summary: Lấy danh sách báo lỗi của user hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách báo lỗi
 */
router.get("/", protect, reportController.getMyReports);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     tags: [Report]
 *     summary: Gửi báo lỗi phim
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [movieSlug, reason]
 *             properties:
 *               movieSlug:
 *                 type: string
 *               movieName:
 *                 type: string
 *               episodeName:
 *                 type: string
 *               episodeUrl:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [video_error, audio_error, broken_link, slow_loading, wrong_subtitle, wrong_info, copyright, other]
 *               detail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã gửi báo lỗi
 */
router.post("/", protect, reportCreateRules, handleValidation, reportController.createReport);

module.exports = router;
