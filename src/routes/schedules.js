const express = require("express");
const router = express.Router();

const ServiceSchedule = require("../models/serviceSchedule");
const Service = require("../models/service");
const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const canManageSchedule = (user, providerId) =>
  user.role === "admin" || Number(user.id) === Number(providerId);

router.post(
  "/",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const { provider_id, service_id, day_of_week, start_time, end_time } =
        req.body;
      const providerId = provider_id || req.user.id;

      if (
        !providerId ||
        !service_id ||
        day_of_week === undefined ||
        !start_time ||
        !end_time
      ) {
        return res.status(400).json({ message: "Data jadwal wajib diisi" });
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
        day_of_week,
        start_time,
        end_time,
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

    const schedules = await ServiceSchedule.findAll({
      where,
      include: [
        { model: User, as: "provider", attributes: ["id", "name", "email"] },
        { model: Service, as: "service" },
      ],
      order: [
        ["day_of_week", "ASC"],
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

      await schedule.update(req.body);

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
