const router = require("express").Router();
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile endpoints
 */

router.use(protect); // đăng nhập mới cho dùng tiếp các route bên dưới

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [User]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get("/profile", getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [User]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/profile", updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags: [User]
 *     summary: Change current user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.put("/change-password", changePassword);

module.exports = router;