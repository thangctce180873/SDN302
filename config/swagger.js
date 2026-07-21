const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NightSweet API",
      version: "1.0.0",
      description: "API documentation for NightSweet Movie Streaming — bao gồm Admin, WatchHistory, Report, Auth",
    },
    tags: [
      { name: "Admin", description: "Backlog: Quản lý phim, thể loại, user, báo lỗi, lịch sử xem" },
      { name: "WatchHistory", description: "Backlog: Lưu lịch sử phim khi user tạm dừng / rời trang" },
      { name: "Report", description: "Backlog: Quản lý báo lỗi phim (user gửi, admin xử lý)" },
      { name: "Auth", description: "Đăng ký / đăng nhập" },
      { name: "Movie", description: "API phim công khai" },
      { name: "User", description: "Thông tin user" },
    ],
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);