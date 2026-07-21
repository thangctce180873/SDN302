const router = require("express").Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification endpoints
 */

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notification]
 *     summary: Get current user's notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     tags: [Notification]
 *     summary: Get unread notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 */
router.get("/unread", notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/read:
 *   put:
 *     tags: [Notification]
 *     summary: Mark notifications as read
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Notifications marked as read
 */
router.put("/read", notificationController.markAsRead);

module.exports = router;
