const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const Booking = require("../models/booking");
const User = require("../models/user");
const Service = require("../models/service");
const ServiceSchedule = require("../models/serviceSchedule");
const TimeSlot = require("../models/timeSlot");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const providerAttributes = ["id", "name", "email", "role", "createdAt", "updatedAt"];
const activeBookingStatuses = ["pending", "confirmed"];

const providerIncludes = [
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
];

const buildProviderPayload = async (body, currentProviderId = null) => {
  const { name, email, password } = body;
  const payload = {};

  if (name !== undefined) payload.name = name;
  if (email !== undefined) {
    const existingEmail = await User.findOne({
      where: {
        email,
        ...(currentProviderId
          ? {
              id: {
                [Op.ne]: currentProviderId,
              },
            }
          : {}),
      },
    });

    if (existingEmail) {
      const error = new Error("Email sudah digunakan");
      error.status = 400;
      throw error;
    }

    payload.email = email;
  }

  if (password !== undefined) {
    if (password.length < 6) {
      const error = new Error("Password minimal 6 karakter");
      error.status = 400;
      throw error;
    }

    payload.password = await bcrypt.hash(password, 10);
  }

  return payload;
};

router.post("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, dan password provider wajib diisi",
      });
    }

    const payload = await buildProviderPayload(req.body);
    const provider = await User.create({
      ...payload,
      role: "provider",
    });

    res.status(201).json({
      message: "Provider berhasil dibuat",
      data: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        role: provider.role,
        createdAt: provider.createdAt,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const providers = await User.findAll({
      where: { role: "provider" },
      attributes: providerAttributes,
      include: [
        {
          model: Service,
          as: "services",
        },
      ],
      order: [["createdAt", "DESC"]],
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
  "/me",
  verifyToken,
  checkRole(["provider"]),
  async (req, res) => {
    try {
      const provider = await User.findOne({
        where: {
          id: req.user.id,
          role: "provider",
        },
        attributes: providerAttributes,
        include: providerIncludes,
      });

      if (!provider) {
        return res.status(404).json({ message: "Provider tidak ditemukan" });
      }

      res.json({
        message: "Profil provider",
        data: provider,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.put(
  "/me",
  verifyToken,
  checkRole(["provider"]),
  async (req, res) => {
    try {
      const provider = await User.findOne({
        where: {
          id: req.user.id,
          role: "provider",
        },
      });

      if (!provider) {
        return res.status(404).json({ message: "Provider tidak ditemukan" });
      }

      const payload = await buildProviderPayload(req.body, provider.id);
      delete payload.role;

      await provider.update(payload);

      res.json({
        message: "Profil provider berhasil diupdate",
        data: {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          role: provider.role,
          updatedAt: provider.updatedAt,
        },
      });
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  },
);

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
      attributes: providerAttributes,
      include: providerIncludes,
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

router.put("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const provider = await User.findOne({
      where: {
        id: req.params.id,
        role: "provider",
      },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider tidak ditemukan" });
    }

    const payload = await buildProviderPayload(req.body, provider.id);
    delete payload.role;

    await provider.update(payload);

    res.json({
      message: "Provider berhasil diupdate",
      data: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        role: provider.role,
        updatedAt: provider.updatedAt,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const provider = await User.findOne({
      where: {
        id: req.params.id,
        role: "provider",
      },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider tidak ditemukan" });
    }

    const activeBookingCount = await Booking.count({
      where: {
        provider_id: provider.id,
        status: {
          [Op.in]: activeBookingStatuses,
        },
      },
    });

    if (activeBookingCount > 0) {
      return res.status(400).json({
        message: "Provider masih memiliki booking aktif",
      });
    }

    await provider.destroy();

    res.json({
      message: "Provider berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
