const router = require("express").Router();
const reportController = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới
router.get("/", reportController.getMyReports);
router.post("/", reportController.createReport);

module.exports = router;
