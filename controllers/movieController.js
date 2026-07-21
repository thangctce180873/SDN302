const movieService = require("../services/movieService");

exports.getNewMovies = async (request, response) => {
  try {
    const data = await movieService.getNewMovies(request.query.page);
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getMovieDetail = async (request, response) => {
  try {
    const data = await movieService.getMovieDetail(request.params.slug);
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getMovieList = async (request, response) => {
  try {
    const data = await movieService.getMovieList(
      request.params.type,
      request.query,
    );
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.searchMovies = async (request, response) => {
  try {
    const data = await movieService.searchMovies(request.query);
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategories = async (_request, response) => {
  try {
    const data = await movieService.getCategories();
    response.json({ success: true, data: movieService.extractItems(data) });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryMovies = async (request, response) => {
  try {
    const data = await movieService.getCategoryMovies(
      request.params.slug,
      request.query,
    );
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getCountries = async (_request, response) => {
  try {
    const data = await movieService.getCountries();
    response.json({ success: true, data: movieService.extractItems(data) });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getCountryMovies = async (request, response) => {
  try {
    const data = await movieService.getCountryMovies(
      request.params.slug,
      request.query,
    );
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getMoviesByYear = async (request, response) => {
  try {
    const data = await movieService.getMoviesByYear(
      request.params.year,
      request.query,
    );
    response.json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
