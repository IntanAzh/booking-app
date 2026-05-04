const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

let posts = [];

// get all

router.get("/", (req, res) => {
  res.json(posts);
});

// create new post
router.post("/", verifyToken, (req, res) => {
  const { title, content } = req.body;

  const newPost = {
    id: posts.length + 1,
    title,
    content,
  };

  posts.push(newPost);

  res.json({ message: "Post dibuat", data: newPost });
});

// delete post
router.delete("/:id", verifyToken, (req, res) => {
  const id = parseInt(req.params.id);

  posts = posts.filter((p) => p.id !== id);

  res.json({ message: "Post dihapus" });
});

module.exports = router;