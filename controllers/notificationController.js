const Notification = require("../models/Notification");

exports.getMyNotifications = async (request, response) => {
  try {
    const notifs = await Notification.find({
      $or: [{ user: request.user._id }, { type: "broadcast" }],
    })
      .sort("-createdAt")
      .limit(30);
    response.json({ success: true, data: notifs });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (request, response) => {
  try {
    const count = await Notification.countDocuments({
      $or: [{ user: request.user._id }, { type: "broadcast" }],
      read: false,
    });
    response.json({ success: true, count });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (request, response) => {
  try {
    await Notification.updateMany(
      { $or: [{ user: request.user._id }, { type: "broadcast" }] },
      { read: true },
    );
    response.json({ success: true });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
