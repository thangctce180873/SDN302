const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieSlug: { type: String, required: true, index: true },
    movieName: { type: String, default: "" },
    title: { type: String, required: true, maxlength: 150 },
    content: { type: String, required: true, maxlength: 3000 },
    score: { type: Number, required: true, min: 1, max: 10 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

reviewSchema.index({ user: 1, movieSlug: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
