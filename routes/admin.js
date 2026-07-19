const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);
router.get("/stats", adminController.getStats);
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);
router.delete("/comments/:id", adminController.deleteComment);
router.get("/reports", adminController.getAllReports);
router.put("/reports/:id", adminController.updateReportStatus);
router.delete("/reports/:id", adminController.deleteReport);
router.delete("/reviews/:id", adminController.deleteReview);
router.post("/notifications", adminController.sendNotification);
router.get("/api-test", adminController.testApiConnection);
router.get("/movies/browse", adminController.browseAPIMovies);
router.get("/movies/api-detail/:slug", adminController.getAPIMovieDetail);
router.get("/movies/categories", adminController.getAPICategories);
router.get("/movies/countries", adminController.getAPICountries);
router.get("/movies/local", adminController.getLocalMovies);
router.post("/movies/import", adminController.importMovie);
router.put("/movies/refresh/:slug", adminController.refreshMovie);
router.put("/movies/featured/:id", adminController.toggleFeatured);
router.put("/movies/:id", adminController.updateLocalMovie);
router.delete("/movies/:id", adminController.deleteLocalMovie);

module.exports = router;
