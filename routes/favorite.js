const router = require("express").Router();
const favoriteController = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới
router.get("/", favoriteController.getFavorites);
router.post("/", favoriteController.addFavorite);
router.get("/check/:movieSlug", favoriteController.checkFavorite);
router.delete("/:movieSlug", favoriteController.removeFavorite);

module.exports = router;
