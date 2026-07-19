const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieSlug: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
