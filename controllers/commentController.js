const Comment = require("../models/Comment");

exports.getComments = async (request, response) => {
  try {
    const comments = await Comment.find({ movieSlug: request.params.movieSlug })
      .populate("user", "name avatar")
      .sort("-createdAt");
    response.json({ success: true, data: comments });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.createComment = async (request, response) => {
  try {
    const comment = await Comment.create({
      user: request.user._id,
      movieSlug: request.params.movieSlug,
      content: request.body.content,
    });
    const populated = await comment.populate("user", "name avatar");
    response.status(201).json({ success: true, data: populated });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComment = async (request, response) => {
  try {
    const comment = await Comment.findById(request.params.id);
    if (!comment) {
      return response
        .status(404)
        .json({ success: false, message: "Không tìm thấy bình luận" });
    }
    if (
      comment.user.toString() !== request.user._id.toString() &&
      request.user.role !== "admin"
    ) {
      return response
        .status(403)
        .json({ success: false, message: "Không có quyền sửa" });
    }
    comment.content = request.body.content;
    await comment.save();
    const populated = await comment.populate("user", "name avatar");
    response.json({ success: true, data: populated });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (request, response) => {
  try {
    const comment = await Comment.findById(request.params.id);
    if (!comment) {
      return response
        .status(404)
        .json({ success: false, message: "Không tìm thấy bình luận" });
    }
    if (
      comment.user.toString() !== request.user._id.toString() &&
      request.user.role !== "admin"
    ) {
      return response
        .status(403)
        .json({ success: false, message: "Không có quyền xóa" });
    }
    await comment.deleteOne();
    response.json({ success: true, message: "Đã xóa bình luận" });
  } catch (error) {
    response.status(500).json({ success: false, message: error.message });
  }
};
