const router = require("express").Router();
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

module.exports = router;
