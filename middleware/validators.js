const { body, param, validationResult } = require("express-validator");

const REPORT_REASONS = [
  "video_error", "audio_error", "broken_link", "slow_loading",
  "wrong_subtitle", "wrong_info", "copyright", "other",
];

const favoriteCreateRules = [
  body("movieSlug").trim().notEmpty().withMessage("movieSlug bắt buộc"),
  body("movieName").trim().notEmpty().withMessage("movieName bắt buộc"),
  body("movieThumb").optional().trim().isLength({ max: 500 }),
  body("movieYear").optional().isInt({ min: 1888, max: new Date().getFullYear() + 1 }),
];

const reportCreateRules = [
  body("movieSlug").trim().notEmpty().withMessage("movieSlug bắt buộc"),
  body("movieName").optional().trim().isLength({ max: 200 }),
  body("episodeName").optional().trim().isLength({ max: 100 }),
  body("episodeUrl").optional({ values: "falsy" }).isURL().withMessage("episodeUrl phải là URL hợp lệ"),
  body("reason").isIn(REPORT_REASONS).withMessage("Loại lỗi không hợp lệ"),
  body("detail").optional().trim().isLength({ max: 1000 }).withMessage("Mô tả tối đa 1000 ký tự"),
];

const reportStatusRules = [
  param("id").isMongoId().withMessage("ID báo cáo không hợp lệ"),
  body("status").isIn(["pending", "resolved", "dismissed"]).withMessage("Trạng thái không hợp lệ"),
  body("adminNote").optional().trim().isLength({ max: 500 }),
];

const watchHistoryRules = [
  body("movieSlug").trim().notEmpty().withMessage("movieSlug bắt buộc"),
  body("movieName").trim().notEmpty().withMessage("movieName bắt buộc"),
  body("movieThumb").optional().trim().isLength({ max: 500 }),
  body("episodeName").optional().trim().isLength({ max: 100 }),
  body("episodeIndex").optional().isInt({ min: 0 }),
  body("serverIndex").optional().isInt({ min: 0 }),
  body("progress").optional().isFloat({ min: 0 }),
  body("duration").optional().isFloat({ min: 0 }),
  body("eventType").optional().isIn(["start", "pause", "leave", "interval", "update"]).withMessage("eventType không hợp lệ"),
];

const importMovieRules = [
  body("slug").trim().matches(/^[a-z0-9\-]+$/).withMessage("Slug không hợp lệ"),
];

const notificationRules = [
  body("title").trim().isLength({ min: 2, max: 120 }).withMessage("Tiêu đề 2-120 ký tự"),
  body("message").trim().isLength({ min: 2, max: 500 }).withMessage("Nội dung 2-500 ký tự"),
  body("type").optional().isIn(["broadcast", "personal"]).withMessage("type không hợp lệ"),
  body("userId").optional().isMongoId().withMessage("userId không hợp lệ"),
];

const apiConfigRules = [
  body("movieApiBaseUrl").trim().isURL().withMessage("URL API không hợp lệ"),
];

const mongoIdParam = (name = "id") => [
  param(name).isMongoId().withMessage(`${name} không hợp lệ`),
];

const userRoleRules = [
  param("id").isMongoId().withMessage("ID user không hợp lệ"),
  body("role").isIn(["user", "admin"]).withMessage("Role phải là user hoặc admin"),
];

const slugParamRules = [
  param("slug").trim().matches(/^[a-z0-9\-]+$/).withMessage("Slug không hợp lệ"),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
}

module.exports = {
  favoriteCreateRules,
  reportCreateRules,
  reportStatusRules,
  watchHistoryRules,
  importMovieRules,
  notificationRules,
  apiConfigRules,
  mongoIdParam,
  userRoleRules,
  slugParamRules,
  handleValidation,
};
