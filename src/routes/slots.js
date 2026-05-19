const express = require("express");
const router = express.Router();

const TimeSlot = require("../models/timeSlot");
const Service = require("../models/service");
const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const canManageSlot = (user, providerId) =>
  user.role === "admin" || Number(user.id) === Number(providerId);

router.post(
  "/",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const { provider_id, service_id, slot_date, start_time, end_time, status } =
        req.body;
      const providerId = provider_id || req.user.id;

      if (!providerId || !service_id || !slot_date || !start_time || !end_time) {
        return res.status(400).json({ message: "Data slot wajib diisi" });
      }

      if (!canManageSlot(req.user, providerId)) {
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

      const slot = await TimeSlot.create({
        provider_id: providerId,
        service_id,
        slot_date,
        start_time,
        end_time,
        status: status || "available",
      });

      res.status(201).json({
        message: "Slot waktu berhasil dibuat",
        data: slot,
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
    if (req.query.slot_date) where.slot_date = req.query.slot_date;
    if (req.query.status) where.status = req.query.status;

    const slots = await TimeSlot.findAll({
      where,
      include: [
        { model: User, as: "provider", attributes: ["id", "name", "email"] },
        { model: Service, as: "service" },
      ],
      order: [["start_time", "ASC"]],
    });

    res.json({
      message: "Data slot waktu",
      data: slots,
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
      const slot = await TimeSlot.findByPk(req.params.id);

      if (!slot) {
        return res.status(404).json({ message: "Slot tidak ditemukan" });
      }

      if (!canManageSlot(req.user, slot.provider_id)) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      await slot.update(req.body);

      res.json({
        message: "Slot waktu berhasil diupdate",
        data: slot,
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
      const slot = await TimeSlot.findByPk(req.params.id);

      if (!slot) {
        return res.status(404).json({ message: "Slot tidak ditemukan" });
      }

      if (!canManageSlot(req.user, slot.provider_id)) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      await slot.update({ status: "blocked" });

      res.json({ message: "Slot waktu berhasil diblokir" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;
