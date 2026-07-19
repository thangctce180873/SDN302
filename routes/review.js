const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.get("/:movieSlug", reviewController.getReviews);
router.post("/:movieSlug", protect, reviewController.createReview);
router.put("/:id/like", protect, reviewController.likeReview);
router.delete("/:id", protect, reviewController.deleteReview);

module.exports = router;
