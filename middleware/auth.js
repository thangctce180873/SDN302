const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.setUser = async (request, response, next) => {
  response.locals.user = null;
  const token = request.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        request.user = user;
        response.locals.user = user;
      }
    } catch (error) {
      response.clearCookie("token");
    }
  }
  next();
};

exports.protect = async (request, response, next) => {
  const token = request.cookies.token;

  if (!token) {
    if (request.originalUrl.startsWith("/api/")) {
      return response
        .status(401)
        .json({ success: false, message: "Vui lòng đăng nhập" });
    }
    return response.redirect("/login");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error();
    request.user = user;
    next();
  } catch (error) {
    response.clearCookie("token");
    if (request.originalUrl.startsWith("/api/")) {
      return response
        .status(401)
        .json({ success: false, message: "Token không hợp lệ" });
    }
    return response.redirect("/login");
  }
};

exports.optionalAuth = async (request, response, next) => {
  const token = request.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) request.user = user;
    } catch (error) {}
  }
  next();
};

exports.adminOnly = (request, response, next) => {
  if (request.user.role !== "admin") {
    if (request.originalUrl.startsWith("/api/")) {
      return response
        .status(403)
        .json({ success: false, message: "Chỉ admin mới có quyền" });
    }
    return response.redirect("/");
  }
  next();
};
