const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieSlug: { type: String, required: true },
    movieName: { type: String, required: true },
    movieThumb: { type: String, default: "" },
    movieYear: { type: Number },
  },
  { timestamps: true },
);

favoriteSchema.index({ user: 1, movieSlug: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
