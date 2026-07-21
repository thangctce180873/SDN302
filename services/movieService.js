const axios = require("axios");

const BASE = (process.env.MOVIE_API_BASE_URL || "https://phimapi.com").replace(
  /\/+$/,
  "",
);

const api = axios.create({ baseURL: BASE, timeout: 10000 });

const get = async (path, params = {}) => {
  const pathsToTry = [path];
  if (path.startsWith("/v1/api")) {
    pathsToTry.push(path.replace(/^\/v1\/api/, "") || "/");
  } else {
    pathsToTry.push(`/v1/api${path}`);
  }

  let lastError;
  for (const tryPath of [...new Set(pathsToTry)]) {
    try {
      const { data } = await api.get(tryPath, { params });
      return data;
    } catch (error) {
      lastError = error;
      if (error.response?.status === 404) continue;
      throw error;
    }
  }

  console.error(
    "movieService request failed:",
    pathsToTry,
    params,
    lastError?.response?.status,
    lastError?.response?.data || lastError?.message,
  );
  throw lastError;
};

/** API phimapi trả về { data: { items: [...] } } hoặc { items: [...] } */
const extractItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

module.exports = {
  extractItems,
  getNewMovies: (page = 1) => get("/danh-sach/phim-moi-cap-nhat", { page }),
  getMovieDetail: (slug) => get(`/phim/${slug}`),
  getMovieList: (type, params = {}) => get(`/danh-sach/${type}`, params),
  getTheaterMovies: (page = 1) => get("/danh-sach/phim-chieu-rap", { page }),
  searchMovies: (params = {}) => get("/tim-kiem", params),
  getCategories: () => get("/the-loai"),
  getCategoryMovies: (slug, params = {}) => get(`/the-loai/${slug}`, params),
  getCountries: () => get("/quoc-gia"),
  getCountryMovies: (slug, params = {}) => get(`/quoc-gia/${slug}`, params),
  getMoviesByYear: (year, params = {}) => get(`/nam/${year}`, params),
};
