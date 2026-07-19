const router = require("express").Router();
const commentController = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

router.get("/:movieSlug", commentController.getComments);
router.post("/:movieSlug", protect, commentController.createComment);
router.put("/:id", protect, commentController.updateComment);
router.delete("/:id", protect, commentController.deleteComment);

module.exports = router;
