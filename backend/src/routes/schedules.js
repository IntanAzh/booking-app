const express = require("express");
const router = express.Router();

const ServiceSchedule = require("../models/serviceSchedule");
const Service = require("../models/service");
const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const canManageSchedule = (user, providerId) =>
  user.role === "admin" || Number(user.id) === Number(providerId);

const validDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const parseBoolean = (value) => value === true || value === "true" || value === 1;

router.post(
  "/",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const {
        provider_id,
        service_id,
        day,
        start_time,
        end_time,
        is_available,
      } = req.body;
      const providerId = provider_id || req.user.id;

      if (!providerId || !service_id || !day || !start_time || !end_time) {
        return res.status(400).json({ message: "Data jadwal wajib diisi" });
      }

      if (!validDays.includes(day)) {
        return res.status(400).json({
          message:
            "Day tidak valid. Gunakan monday, tuesday, wednesday, thursday, friday, saturday, atau sunday",
        });
      }

      if (!canManageSchedule(req.user, providerId)) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      const provider = await User.findByPk(providerId);
      if (!provider || provider.role !== "provider") {
        return res.status(404).json({ message: "Provider tidak ditemukan" });
      }

      const service = await Service.findByPk(service_id);
      if (!service) {
        return res.status(404).json({ message: "Service tidak ditemukan" });
      }

      const schedule = await ServiceSchedule.create({
        provider_id: providerId,
        service_id,
        day,
        start_time,
        end_time,
        is_available:
          is_available === undefined ? true : parseBoolean(is_available),
      });

      res.status(201).json({
        message: "Jadwal layanan berhasil dibuat",
        data: schedule,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.provider_id) where.provider_id = req.query.provider_id;
    if (req.query.service_id) where.service_id = req.query.service_id;
    if (req.query.day) where.day = req.query.day;
    if (req.query.is_available !== undefined) {
      where.is_available = req.query.is_available === "true";
    }

    const schedules = await ServiceSchedule.findAll({
      where,
      include: [
        { model: User, as: "provider", attributes: ["id", "name", "email"] },
        { model: Service, as: "service" },
      ],
      order: [
        ["day", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    res.json({
      message: "Data jadwal layanan",
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const schedule = await ServiceSchedule.findByPk(req.params.id, {
      include: [
        { model: User, as: "provider", attributes: ["id", "name", "email"] },
        { model: Service, as: "service" },
      ],
    });

    if (!schedule) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    res.json({
      message: "Detail jadwal layanan",
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put(
  "/:id",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const schedule = await ServiceSchedule.findByPk(req.params.id);

      if (!schedule) {
        return res.status(404).json({ message: "Jadwal tidak ditemukan" });
      }

      if (!canManageSchedule(req.user, schedule.provider_id)) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      const payload = { ...req.body };
      if (payload.day && !validDays.includes(payload.day)) {
        return res.status(400).json({
          message:
            "Day tidak valid. Gunakan monday, tuesday, wednesday, thursday, friday, saturday, atau sunday",
        });
      }

      if (payload.is_available !== undefined) {
        payload.is_available = parseBoolean(payload.is_available);
      }

      delete payload.day_of_week;
      delete payload.is_active;

      await schedule.update(payload);

      res.json({
        message: "Jadwal layanan berhasil diupdate",
        data: schedule,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const schedule = await ServiceSchedule.findByPk(req.params.id);

      if (!schedule) {
        return res.status(404).json({ message: "Jadwal tidak ditemukan" });
      }

      if (!canManageSchedule(req.user, schedule.provider_id)) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      await schedule.destroy();

      res.json({ message: "Jadwal layanan berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;
