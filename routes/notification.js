const router = require("express").Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới
router.get("/", notificationController.getMyNotifications);
router.get("/unread", notificationController.getUnreadCount);
router.put("/read", notificationController.markAsRead);

module.exports = router;
