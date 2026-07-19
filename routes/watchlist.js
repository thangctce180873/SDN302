const router = require("express").Router();
const watchlistController = require("../controllers/watchlistController");
const { protect } = require("../middleware/auth");

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới
router.get("/", watchlistController.getWatchlist);
router.post("/", watchlistController.addToWatchlist);
router.get("/check/:movieSlug", watchlistController.checkWatchlist);
router.delete("/:movieSlug", watchlistController.removeFromWatchlist);

module.exports = router;
