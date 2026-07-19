const User = require("../models/User");

exports.getProfile = async (request, response) => {
  response.json({ success: true, data: request.user });
};

exports.updateProfile = async (request, response) => {
  try {
    const { name, avatar } = request.body;
    const user = await User.findByIdAndUpdate(
      request.user._id,
      { name, avatar },
      { new: true, runValidators: true },
    );
    response.json({ success: true, data: user });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (request, response) => {
  try {
    const { currentPassword, newPassword } = request.body;
    const user = await User.findById(request.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return response
        .status(400)
        .json({ success: false, message: "Mật khẩu hiện tại không đúng" });
    }
    user.password = newPassword;
    await user.save();
    response.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
