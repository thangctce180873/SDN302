const router = require("express").Router();
const movieController = require("../controllers/movieController");

router.get("/new", movieController.getNewMovies);
router.get("/search", movieController.searchMovies);
router.get("/categories", movieController.getCategories);
router.get("/category/:slug", movieController.getCategoryMovies);
router.get("/countries", movieController.getCountries);
router.get("/country/:slug", movieController.getCountryMovies);
router.get("/year/:year", movieController.getMoviesByYear);
router.get("/list/:type", movieController.getMovieList);
router.get("/:slug", movieController.getMovieDetail);

module.exports = router;
