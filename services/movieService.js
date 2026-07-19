const axios = require("axios");
const BASE = process.env.MOVIE_API_BASE_URL || "https://phimapi.com";
const api = axios.create({ baseURL: BASE, timeout: 10000 });

const get = async (url, params) => {
  const { data } = await api.get(url, { params });
  return data;
};

module.exports = {
  getNewMovies: (page = 1) => get("/danh-sach/phim-moi-cap-nhat", { page }),
  getMovieDetail: (slug) => get(`/phim/${slug}`),
  getMovieList: (type, params = {}) => get(`/v1/api/danh-sach/${type}`, params),
  getTheaterMovies: (page = 1) => get("/danh-sach/phim-chieu-rap", { page }),
  searchMovies: (params = {}) => get("/v1/api/tim-kiem", params),
  getCategories: () => get("/the-loai"),
  getCategoryMovies: (slug, params = {}) =>
    get(`/v1/api/the-loai/${slug}`, params),
  getCountries: () => get("/quoc-gia"),
  getCountryMovies: (slug, params = {}) =>
    get(`/v1/api/quoc-gia/${slug}`, params),
  getMoviesByYear: (year, params = {}) => get(`/v1/api/nam/${year}`, params),
};
