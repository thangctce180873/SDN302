const router = require("express").Router();
const ratingController = require("../controllers/ratingController");
const { protect, optionalAuth } = require("../middleware/auth");

router.post("/:movieSlug", protect, ratingController.rateMovie);
router.get("/:movieSlug", optionalAuth, ratingController.getMovieRating);

module.exports = router;
