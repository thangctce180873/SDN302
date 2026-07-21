const WatchHistory = require("../models/WatchHistory");

exports.addHistory = async (request, response) => {
  try {
    const {
      movieSlug,
      movieName,
      movieThumb,
      episodeName,
      episodeIndex,
      serverIndex,
      progress,
      duration,
      eventType,
    } = request.body;
    await WatchHistory.findOneAndUpdate(
      { user: request.user._id, movieSlug, episodeName: episodeName || "" },
      {
        movieName,
        movieThumb,
        episodeName: episodeName || "",
        episodeIndex: episodeIndex || 0,
        serverIndex: serverIndex || 0,
        progress: progress || 0,
        duration: duration || 0,
        eventType: eventType || "update",
        watchedAt: new Date(),
      },
      { upsert: true, new: true },
    );
    response.json({ success: true });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (request, response) => {
  try {
    const history = await WatchHistory.find({ user: request.user._id })
      .sort("-watchedAt")
      .limit(50);
    response.json({ success: true, data: history });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.clearHistory = async (request, response) => {
  try {
    await WatchHistory.deleteMany({ user: request.user._id });
    response.json({ success: true, message: "Đã xóa lịch sử" });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOne = async (request, response) => {
  try {
    await WatchHistory.findOneAndDelete({
      _id: request.params.id,
      user: request.user._id,
    });
    response.json({ success: true, message: "Đã xóa" });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
