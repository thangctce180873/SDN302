const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    sendToken(user, 200, response);
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = (_request, response) => {
  response.clearCookie("token");
  response.json({ success: true, message: "Đã đăng xuất" });
};

exports.getMe = async (request, response) => {
  response.json({ success: true, data: request.user });
};
