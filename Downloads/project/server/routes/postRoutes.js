const express = require("express");
const {
  getPosts,
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getPosts);

// Protected — order matters: /my must come before /:id
router.get("/my", protect, getMyPosts);
router.get("/:id", protect, getPostById);
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
