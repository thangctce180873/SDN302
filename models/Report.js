const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieSlug: { type: String, required: true },
    movieName: { type: String, default: "" },
    episodeName: { type: String, default: "" },
    episodeUrl: { type: String, default: "" },
    reason: {
      type: String,
      enum: [
        "video_error",
        "audio_error",
        "broken_link",
        "slow_loading",
        "wrong_subtitle",
        "wrong_info",
        "copyright",
        "other",
      ],
      required: true,
    },
    detail: { type: String, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
