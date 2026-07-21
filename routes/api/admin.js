const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const { protect, adminOnly } = require("../../middleware/auth");
const movieService = require("../../services/movieService");
const Movie = require("../../models/Movie");
const Comment = require("../../models/Comment");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

// Import movie from external API into local DB
router.post("/import-movie", protect, adminOnly, async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ message: "Missing slug" });
    const apiResp = await movieService.getMovieDetail(slug);
    const mv = apiResp.movie || apiResp;
    if (!mv || !mv.slug) return res.status(404).json({ message: "Movie not found on API" });

    const exists = await Movie.findOne({ slug: mv.slug });
    if (exists) return res.status(200).json({ message: "Movie already imported", movie: exists });

    const doc = new Movie({
      name: mv.name || mv.title,
      origin_name: mv.origin_name || "",
      slug: mv.slug,
      year: mv.year || mv.release_year,
      description: mv.content || mv.description || "",
      thumb: mv.thumb || mv.poster || "",
      category: (mv.category || mv.categories || []).map(c => (typeof c === "string" ? c : c.slug || c.name)),
      country: (mv.country || mv.countries || []).map(c => (typeof c === "string" ? c : c.slug || c.name)),
      raw: mv,
    });
    await doc.save();
    return res.json({ message: "Imported", movie: doc });
  } catch (err) { console.error(err); return res.status(500).json({ message: err.message }); }
});

// Delete comment
router.delete("/comments/:id", protect, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    await Comment.findByIdAndDelete(id);
    return res.json({ message: "Deleted" });
  } catch (err) { return res.status(500).json({ message: err.message }); }
});

// Users CRUD (create, update, delete)
router.post("/users", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });
    const u = new User({ name, email, role });
    if (password) u.password = password;
    await u.save();
    return res.json({ message: "Created", user: u });
  } catch (err) { return res.status(500).json({ message: err.message }); }
});

router.put("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    if (updates.password) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "Not found" });
      user.name = updates.name ?? user.name;
      user.role = updates.role ?? user.role;
      if (updates.password) user.password = updates.password;
      await user.save();
      return res.json({ message: "Updated", user });
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    return res.json({ message: "Updated", user });
  } catch (err) { return res.status(500).json({ message: err.message }); }
});

router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: "Deleted" });
  } catch (err) { return res.status(500).json({ message: err.message }); }
});

// Send admin notification
router.post("/notifications", protect, adminOnly, async (req, res) => {
  try {
    const { title, message, type = "broadcast", userId } = req.body;
    const n = new Notification({ title, message, type, user: type === "personal" ? userId : null });
    await n.save();
    return res.json({ message: "Sent", notif: n });
  } catch (err) { return res.status(500).json({ message: err.message }); }
});

// Update MOVIE_API_BASE_URL in .env (simple replace). Nodemon/server restart required to apply.
router.post("/api-config", protect, adminOnly, async (req, res) => {
  try {
    const { movieApiBaseUrl } = req.body;
    if (!movieApiBaseUrl) return res.status(400).json({ message: "Missing movieApiBaseUrl" });
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return res.status(500).json({ message: ".env not found" });
    const content = fs.readFileSync(envPath, "utf8");
    const replaced = content.match(/^MOVIE_API_BASE_URL=/m)
      ? content.replace(/^MOVIE_API_BASE_URL=.*$/m, `MOVIE_API_BASE_URL=${movieApiBaseUrl}`)
      : content + `\nMOVIE_API_BASE_URL=${movieApiBaseUrl}\n`;
    fs.writeFileSync(envPath, replaced, "utf8");
    return res.json({ message: "Config updated. Restart server to apply." });
  } catch (err) { return res.status(500).json({ message: err.message }); }
});

module.exports = router;