const router = require("express").Router();
const movieController = require("../controllers/movieController");

/**
 * @swagger
 * tags:
 *   name: Movie
 *   description: Movie browsing endpoints
 */

/**
 * @swagger
 * /api/movies/new:
 *   get:
 *     tags: [Movie]
 *     summary: Get new movies
 *     responses:
 *       200:
 *         description: List of new movies
 */
router.get("/new", movieController.getNewMovies);

/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     tags: [Movie]
 *     summary: Search movies
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", movieController.searchMovies);

/**
 * @swagger
 * /api/movies/categories:
 *   get:
 *     tags: [Movie]
 *     summary: Get movie categories
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/categories", movieController.getCategories);

/**
 * @swagger
 * /api/movies/category/{slug}:
 *   get:
 *     tags: [Movie]
 *     summary: Get movies by category
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movies in the category
 */
router.get("/category/:slug", movieController.getCategoryMovies);

/**
 * @swagger
 * /api/movies/countries:
 *   get:
 *     tags: [Movie]
 *     summary: Get movie countries
 *     responses:
 *       200:
 *         description: List of countries
 */
router.get("/countries", movieController.getCountries);

/**
 * @swagger
 * /api/movies/country/{slug}:
 *   get:
 *     tags: [Movie]
 *     summary: Get movies by country
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movies from the country
 */
router.get("/country/:slug", movieController.getCountryMovies);

/**
 * @swagger
 * /api/movies/year/{year}:
 *   get:
 *     tags: [Movie]
 *     summary: Get movies by year
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movies from the year
 */
router.get("/year/:year", movieController.getMoviesByYear);

/**
 * @swagger
 * /api/movies/list/{type}:
 *   get:
 *     tags: [Movie]
 *     summary: Get movie list by type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: list type, e.g. popular, top-rated
 *     responses:
 *       200:
 *         description: Movie list
 */
router.get("/list/:type", movieController.getMovieList);

/**
 * @swagger
 * /api/movies/{slug}:
 *   get:
 *     tags: [Movie]
 *     summary: Get movie details
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie detail
 */
router.get("/:slug", movieController.getMovieDetail);

module.exports = router;
