const express = require("express");
const router = express.Router();

const Service = require("../models/service");
const Category = require("../models/category");

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// Create Service

router.post(
  "/",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const {
        category_id,
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
          message: "Data wajib diisi",
        });
      }

      const service = await Service.create({
        category_id,
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
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

// Get All Services

router.get("/", async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [
        {
          model: Category,
          as: "category",
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

      await service.update(req.body);

      res.json({
        message: "Service berhasil diupdate",
        data: service,
      });
    } catch (error) {
      res.status(500).json({
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
