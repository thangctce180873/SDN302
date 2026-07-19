const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    origin_name: { type: String, default: "" },
    content: { type: String, default: "" },
    thumb_url: { type: String, default: "" },
    poster_url: { type: String, default: "" },
    type: { type: String, default: "" },
    status: { type: String, default: "" },
    year: { type: Number },
    time: { type: String, default: "" },
    quality: { type: String, default: "" },
    language: { type: String, default: "" },
    episode_current: { type: String, default: "" },
    episode_total: { type: String, default: "" },
    categories: [{ name: String, slug: String }],
    countries: [{ name: String, slug: String }],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Movie", movieSchema);
