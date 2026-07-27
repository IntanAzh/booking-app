const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Category = require("../models/category");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildUniqueSlug = async (name, currentId = null) => {
  const baseSlug = slugify(name);
  if (!baseSlug) return null;

  let slug = baseSlug;
  let suffix = 2;

  while (
    await Category.findOne({
      where: {
        slug,
        ...(currentId
          ? {
              id: {
                [Op.ne]: currentId,
              },
            }
          : {}),
      },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

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
router.post("/", verifyToken, checkRole(["admin", "provider"]), async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    if (!name) return res.status(400).json({ message: "Name wajib diisi" });
    
    const slug = await buildUniqueSlug(name);
    const category = await Category.create({ name, slug, description, image_url });
    res.status(201).json({ message: "Category berhasil dibuat", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category
router.put("/:id", verifyToken, checkRole(["admin", "provider"]), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category tidak ditemukan" });

    const payload = { ...req.body };
    delete payload.slug;

    if (payload.name !== undefined) {
      if (!payload.name) return res.status(400).json({ message: "Name wajib diisi" });
      payload.slug = await buildUniqueSlug(payload.name, category.id);
    }

    await category.update(payload);
    res.json({ message: "Category berhasil diupdate", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category
router.delete("/:id", verifyToken, checkRole(["admin", "provider"]), async (req, res) => {
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
