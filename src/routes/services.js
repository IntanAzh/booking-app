const express = require("express");
const router = express.Router();

const Service = require("../models/service");
const Category = require("../models/category");
const User = require("../models/user");

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const validateCategory = async (categoryId) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category tidak ditemukan. Buat category terlebih dahulu.");
    error.status = 404;
    throw error;
  }

  return category;
};

const validateProvider = async (providerId) => {
  if (!providerId) {
    const error = new Error("Provider wajib diisi. Buat provider terlebih dahulu.");
    error.status = 400;
    throw error;
  }

  const provider = await User.findOne({
    where: {
      id: providerId,
      role: "provider",
    },
  });

  if (!provider) {
    const error = new Error("Provider tidak ditemukan atau role bukan provider.");
    error.status = 404;
    throw error;
  }

  return provider;
};

// Create Service

router.post(
  "/",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const {
        category_id,
        provider_id,
        name,
        slug,
        description,
        price,
        duration,
        image_url,
      } = req.body;

      // validasi
      if (!category_id || !name || !price || !duration) {
        return res.status(400).json({
          message: "Category, name, price, dan duration wajib diisi",
        });
      }

      const providerId =
        provider_id || (req.user.role === "provider" ? req.user.id : null);

      if (
        req.user.role === "provider" &&
        Number(providerId) !== Number(req.user.id)
      ) {
        return res.status(403).json({
          message: "Provider hanya bisa membuat layanan untuk dirinya sendiri",
        });
      }

      await validateCategory(category_id);
      await validateProvider(providerId);

      const service = await Service.create({
        category_id,
        provider_id: providerId,
        name,
        slug,
        description,
        price,
        duration,
        image_url,
      });

      res.status(201).json({
        message: "Service berhasil dibuat",
        data: service,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
      });
    }
  },
);

// Get All Services

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.provider_id) where.provider_id = req.query.provider_id;
    if (req.query.category_id) where.category_id = req.query.category_id;

    const services = await Service.findAll({
      where,
      include: [
        {
          model: Category,
          as: "category",
        },
        {
          model: User,
          as: "provider",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json({
      message: "Data services",
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get Service by ID

router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category",
        },
        {
          model: User,
          as: "provider",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({
        message: "Service tidak ditemukan",
      });
    }

    res.json({
      message: "Detail service",
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Service

router.put(
  "/:id",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const service = await Service.findByPk(req.params.id);

      if (!service) {
        return res.status(404).json({
          message: "Service tidak ditemukan",
        });
      }

      if (
        req.user.role === "provider" &&
        Number(service.provider_id) !== Number(req.user.id)
      ) {
        return res.status(403).json({
          message: "Akses ditolak",
        });
      }

      const payload = { ...req.body };
      if (req.user.role === "provider") {
        delete payload.provider_id;
      }

      if (payload.category_id !== undefined) {
        if (!payload.category_id) {
          return res.status(400).json({
            message: "Category tidak boleh kosong",
          });
        }

        await validateCategory(payload.category_id);
      }

      if (payload.provider_id !== undefined) {
        if (!payload.provider_id) {
          return res.status(400).json({
            message: "Provider tidak boleh kosong",
          });
        }

        await validateProvider(payload.provider_id);
      }

      await service.update(payload);

      res.json({
        message: "Service berhasil diupdate",
        data: service,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message,
      });
    }
  },
);

// Delete Service

router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service tidak ditemukan",
      });
    }

    await service.destroy();

    res.json({
      message: "Service berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
