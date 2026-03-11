const Post = require("../models/Post");

// GET all posts (with pagination)
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username email");
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Only the owner can fetch for editing
    if (post.author._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to access this post" });

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET posts by the logged-in user (dashboard)
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create a new post
const createPost = async (req, res) => {
  const { title, content } = req.body;
  try {
    if (!title || !content)
      return res.status(400).json({ success: false, message: "Title and content are required" });

    const post = await Post.create({ title, content, author: req.user._id });
    await post.populate("author", "username email");
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update a post (ownership check)
const updatePost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Ownership check
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to update this post" });

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    await post.populate("author", "username email");
    res.json({ success: true, message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a post (ownership check)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Ownership check
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" });

    await post.deleteOne();
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPosts, getPostById, getMyPosts, createPost, updatePost, deletePost };
