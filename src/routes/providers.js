const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Service = require("../models/service");
const ServiceSchedule = require("../models/serviceSchedule");
const TimeSlot = require("../models/timeSlot");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

router.get("/", async (req, res) => {
  try {
    const providers = await User.findAll({
      where: { role: "provider" },
      attributes: ["id", "name", "email", "createdAt"],
      include: [
        {
          model: Service,
          as: "services",
        },
      ],
    });

    res.json({
      message: "Data penyedia layanan",
      data: providers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/me/services",
  verifyToken,
  checkRole(["provider"]),
  async (req, res) => {
    try {
      const services = await Service.findAll({
        where: { provider_id: req.user.id },
      });

      res.json({
        message: "Data layanan milik provider",
        data: services,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.get("/:id", async (req, res) => {
  try {
    const provider = await User.findOne({
      where: {
        id: req.params.id,
        role: "provider",
      },
      attributes: ["id", "name", "email", "createdAt"],
      include: [
        {
          model: Service,
          as: "services",
        },
        {
          model: ServiceSchedule,
          as: "service_schedules",
        },
        {
          model: TimeSlot,
          as: "time_slots",
        },
      ],
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider tidak ditemukan" });
    }

    res.json({
      message: "Detail penyedia layanan",
      data: provider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
