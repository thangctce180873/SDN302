const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

async function logActivity(req, userId, action, detail = "") {
  try {
    const ip = req.ip || req.connection?.remoteAddress || "";
    const log = new ActivityLog({
      user: userId || null,
      action,
      target: "Tài khoản",
      detail,
      ip,
    });
    await log.save();
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

const sendToken = (user, statusCode, response) => {
  const token = signToken(user._id);
  response.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  user.password = undefined;
  response.status(statusCode).json({ success: true, data: { user, token } });
};

exports.register = async (request, response) => {
  try {
    const { name, email, password } = request.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return response
        .status(400)
        .json({ success: false, message: "Email đã được sử dụng" });
    }
    const user = await User.create({ name, email, password });
    await logActivity(request, user._id, "Đăng ký", `Email: ${user.email}`);
    sendToken(user, 201, response);
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response
        .status(400)
        .json({ success: false, message: "Vui lòng nhập email và mật khẩu" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return response
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }
    await logActivity(request, user._id, "Đăng nhập", `Email: ${user.email}`);
    sendToken(user, 200, response);
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (request, response) => {
  let userId = null;
  const token = request.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (e) {}
  }
  await logActivity(request, userId, "Đăng xuất", "");
  response.clearCookie("token");
  response.json({ success: true, message: "Đã đăng xuất" });
};

exports.getMe = async (request, response) => {
  response.json({ success: true, data: request.user });
};
