const express = require("express");
const router = express.Router();

const { Op } = require("sequelize");
const Booking = require("../models/booking");
const TimeSlot = require("../models/timeSlot");
const Service = require("../models/service");
const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const canManageSlot = (user, providerId) =>
  user.role === "admin" || Number(user.id) === Number(providerId);

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"];

const withSlotAvailability = async (slot) => {
  const plainSlot = slot.toJSON();
  const activeBookingCount = await Booking.count({
    where: {
      slot_id: slot.id,
      status: {
        [Op.in]: ACTIVE_BOOKING_STATUSES,
      },
    },
  });

  return {
    ...plainSlot,
    active_bookings: activeBookingCount,
    remaining_capacity: Math.max(Number(slot.capacity) - activeBookingCount, 0),
    is_full: activeBookingCount >= Number(slot.capacity),
  };
};

const parseSlotDateTime = (dateStr, timeStr) => {
  if (!timeStr) return null;
  if (typeof timeStr === "string" && (timeStr.includes("T") || timeStr.includes("Z"))) {
    return new Date(timeStr);
  }
  const cleanDate = dateStr ? dateStr : new Date().toISOString().split("T")[0];
  const cleanTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return new Date(`${cleanDate}T${cleanTime}`);
};

router.post(
  "/",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const {
        provider_id,
        service_id,
        slot_date,
        start_time,
        end_time,
        status,
        capacity,
      } = req.body;
      const providerId = provider_id || (req.user.role === "provider" ? req.user.id : null);

      if (!providerId) {
        return res.status(400).json({ message: "provider_id wajib diisi untuk admin" });
      }

      if (!service_id || !slot_date || !start_time || !end_time) {
        return res.status(400).json({ message: "Data slot wajib diisi" });
      }

      if (capacity !== undefined && Number(capacity) < 1) {
        return res.status(400).json({ message: "Capacity minimal 1" });
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

      const parsedStartTime = parseSlotDateTime(slot_date, start_time);
      const parsedEndTime = parseSlotDateTime(slot_date, end_time);

      const slot = await TimeSlot.create({
        provider_id: providerId,
        service_id,
        slot_date,
        start_time: parsedStartTime,
        end_time: parsedEndTime,
        status: status || "available",
        capacity: capacity || 1,
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
    const data = await Promise.all(slots.map(withSlotAvailability));

    res.json({
      message: "Data slot waktu",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/available", async (req, res) => {
  try {
    const where = {
      status: "available",
    };

    if (req.query.provider_id) where.provider_id = req.query.provider_id;
    if (req.query.service_id) where.service_id = req.query.service_id;
    if (req.query.slot_date) where.slot_date = req.query.slot_date;

    const slots = await TimeSlot.findAll({
      where,
      include: [
        { model: User, as: "provider", attributes: ["id", "name", "email"] },
        { model: Service, as: "service" },
      ],
      order: [["start_time", "ASC"]],
    });

    const slotsWithAvailability = await Promise.all(
      slots.map(withSlotAvailability),
    );
    const availableSlots = slotsWithAvailability.filter(
      (slot) => !slot.is_full && slot.remaining_capacity > 0,
    );

    res.json({
      message: "Data slot waktu tersedia",
      data: availableSlots,
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

      const payload = { ...req.body };
      if (payload.capacity !== undefined && Number(payload.capacity) < 1) {
        return res.status(400).json({ message: "Capacity minimal 1" });
      }

      if (payload.start_time) {
        const targetDate = payload.slot_date || slot.slot_date;
        payload.start_time = parseSlotDateTime(targetDate, payload.start_time);
      }
      if (payload.end_time) {
        const targetDate = payload.slot_date || slot.slot_date;
        payload.end_time = parseSlotDateTime(targetDate, payload.end_time);
      }

      await slot.update(payload);
      const data = await withSlotAvailability(slot);

      res.json({
        message: "Slot waktu berhasil diupdate",
        data,
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

      await slot.destroy();

      res.json({ message: "Slot waktu berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = router;
