const router = require("express").Router();
const watchHistoryController = require("../controllers/watchHistoryController");
const { protect } = require("../middleware/auth");

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới
router.get("/", watchHistoryController.getHistory);
router.post("/", watchHistoryController.addHistory);
router.delete("/", watchHistoryController.clearHistory);
router.delete("/:id", watchHistoryController.deleteOne);

module.exports = router;
