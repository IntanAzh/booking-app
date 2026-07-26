const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({ message: "Data categories", data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category by id
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category tidak ditemukan" });
    res.json({ message: "Detail category", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category
router.post("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const { name, slug, description, image_url } = req.body;
    if (!name || !slug) return res.status(400).json({ message: "Name dan slug wajib diisi" });
    
    const category = await Category.create({ name, slug, description, image_url });
    res.status(201).json({ message: "Category berhasil dibuat", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category
router.put("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category tidak ditemukan" });

    await category.update(req.body);
    res.json({ message: "Category berhasil diupdate", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category
router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category tidak ditemukan" });

    await category.destroy();
    res.json({ message: "Category berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
