const Report = require("../models/Report");

exports.createReport = async (request, response) => {
  try {
    const { movieSlug, movieName, episodeName, episodeUrl, reason, detail } =
      request.body;
    if (!movieSlug || !reason) {
      return response.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đủ thông tin báo lỗi",
      });
    }
    const report = await Report.create({
      user: request.user._id,
      movieSlug,
      movieName: movieName || "",
      episodeName: episodeName || "",
      episodeUrl: episodeUrl || "",
      reason,
      detail: detail || "",
    });
    response.json({
      success: true,
      data: report,
      message: "Đã gửi báo lỗi thành công",
    });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyReports = async (request, response) => {
  try {
    const reports = await Report.find({ user: request.user._id }).sort(
      "-createdAt",
    );
    response.json({ success: true, data: reports });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
