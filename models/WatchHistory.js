const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieSlug: { type: String, required: true },
    movieName: { type: String, required: true },
    movieThumb: { type: String, default: "" },
    episodeName: { type: String, default: "" },
    episodeIndex: { type: Number, default: 0 },
    serverIndex: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    eventType: {
      type: String,
      enum: ["start", "pause", "leave", "interval", "update"],
      default: "update",
    },
    watchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

watchHistorySchema.index({ user: 1, movieSlug: 1 });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
