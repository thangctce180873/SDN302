require("dotenv").config();
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const { setUser } = require("./middleware/auth");
const User = require("./models/User");

const app = express();

connectDB()
  .then(async () => {
    try {
      const adminExists = await User.findOne({ role: "admin" });
      if (!adminExists) {
        await User.create({
          name: "Admin",
          email: "admin@nightsweet.com",
          password: "Admin123@",
          role: "admin",
        });
        console.log("Default admin created: admin@nightsweet.com | Admin123@");
      }
    } catch (error) {
      console.error("Admin seed error:", error.message);
    }
  })
  .catch((error) => console.error("Database connection error:", error.message));

app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(setUser);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/movies", require("./routes/movie"));
app.use("/api/favorites", require("./routes/favorite"));
app.use("/api/watchlist", require("./routes/watchlist"));
app.use("/api/history", require("./routes/watchHistory"));
app.use("/api/comments", require("./routes/comment"));
app.use("/api/ratings", require("./routes/rating"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/reports", require("./routes/report"));
app.use("/api/admin", require("./routes/admin"));

app.use("/", require("./routes/page"));

app.use((error, request, response, _next) => {
  console.error(error.stack);

  if (request.originalUrl.startsWith("/api/")) {
    return response.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
  response.status(500).render("pages/error", {
    title: "Lỗi",
    message: "Đã xảy ra lỗi server",
  });
});

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`G6 server running on port ${PORT}`);
  });
}
