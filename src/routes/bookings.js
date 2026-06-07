const express = require("express");
const router = express.Router();

const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Service = require("../models/service");
const TimeSlot = require("../models/timeSlot");
const User = require("../models/user");
const { calculateDynamicPrice } = require("../utils/pricing");

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"];

const canAccessBooking = (user, booking) =>
  user.role === "admin" ||
  Number(user.id) === Number(booking.customer_id) ||
  Number(user.id) === Number(booking.provider_id);

const canManageBooking = (user, booking) =>
  user.role === "admin" || Number(user.id) === Number(booking.provider_id);

const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

const bookingIncludes = [
  {
    model: User,
    as: "customer",
    attributes: ["id", "name", "email"],
  },
  {
    model: User,
    as: "provider",
    attributes: ["id", "name", "email"],
  },
  {
    model: Service,
    as: "service",
  },
  {
    model: TimeSlot,
    as: "slot",
  },
  {
    model: Payment,
    as: "payments",
  },
];

const getSlotBookingCount = (slotId, transaction) =>
  Booking.count({
    where: {
      slot_id: slotId,
      status: {
        [Op.in]: ACTIVE_BOOKING_STATUSES,
      },
    },
    transaction,
  });

const syncSlotStatus = async (slotId, transaction) => {
  const slot = await TimeSlot.findByPk(slotId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!slot || slot.status === "blocked") {
    return slot;
  }

  const activeBookingCount = await getSlotBookingCount(slotId, transaction);
  const nextStatus =
    activeBookingCount >= Number(slot.capacity) ? "booked" : "available";

  await slot.update({ status: nextStatus }, { transaction });
  return slot;
};

router.post("/", verifyToken, checkRole(["customer"]), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { service_id, provider_id, slot_id, start_time, end_time } = req.body;

    if (!service_id || (!slot_id && (!provider_id || !start_time))) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "service_id wajib diisi. Gunakan slot_id atau provider_id dan start_time.",
      });
    }

    const service = await Service.findByPk(service_id, { transaction });

    if (!service || !service.is_active) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Service tidak ditemukan atau tidak aktif",
      });
    }

    let slot = null;
    let providerId = provider_id || service.provider_id;
    let startTime = start_time ? new Date(start_time) : null;
    let endTime = end_time ? new Date(end_time) : null;

    if (slot_id) {
      slot = await TimeSlot.findByPk(slot_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!slot) {
        await transaction.rollback();
        return res.status(404).json({ message: "Slot waktu tidak ditemukan" });
      }

      if (slot.status === "blocked") {
        await transaction.rollback();
        return res.status(400).json({ message: "Slot waktu diblokir" });
      }

      if (Number(slot.service_id) !== Number(service_id)) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Slot waktu tidak sesuai dengan service yang dipilih",
        });
      }

      providerId = slot.provider_id;
      startTime = new Date(slot.start_time);
      endTime = new Date(slot.end_time);

      const activeBookingCount = await getSlotBookingCount(slot.id, transaction);
      if (activeBookingCount >= Number(slot.capacity)) {
        await slot.update({ status: "booked" }, { transaction });
        await transaction.rollback();
        return res.status(400).json({
          message: "Slot waktu sudah penuh",
          data: {
            slot_id: slot.id,
            capacity: slot.capacity,
            active_bookings: activeBookingCount,
          },
        });
      }
    }

    if (!providerId) {
      await transaction.rollback();
      return res.status(400).json({
        message: "provider_id wajib diisi jika service belum punya provider",
      });
    }

    const provider = await User.findByPk(providerId, { transaction });
    if (!provider || provider.role !== "provider") {
      await transaction.rollback();
      return res.status(404).json({ message: "Provider tidak ditemukan" });
    }

    if (!endTime) {
      endTime = addMinutes(startTime, service.duration);
    }

    if (!startTime || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      await transaction.rollback();
      return res.status(400).json({ message: "Format waktu tidak valid" });
    }

    if (endTime <= startTime) {
      await transaction.rollback();
      return res.status(400).json({
        message: "end_time harus lebih besar dari start_time",
      });
    }

    const bufferEnd = addMinutes(endTime, 15);
    if (!slot) {
      const overlappingBooking = await Booking.findOne({
        where: {
          service_id,
          provider_id: providerId,
          status: {
            [Op.in]: ACTIVE_BOOKING_STATUSES,
          },
          start_time: {
            [Op.lt]: bufferEnd,
          },
          buffer_end_time: {
            [Op.gt]: startTime,
          },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (overlappingBooking) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Slot waktu bentrok dengan booking lain",
        });
      }
    } else {
      const overlappingBooking = await Booking.findOne({
        where: {
          slot_id: {
            [Op.ne]: slot.id,
          },
          service_id,
          provider_id: providerId,
          status: {
            [Op.in]: ACTIVE_BOOKING_STATUSES,
          },
          start_time: {
            [Op.lt]: bufferEnd,
          },
          buffer_end_time: {
            [Op.gt]: startTime,
          },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (overlappingBooking) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Jam booking bentrok dengan slot lain",
        });
      }
    }

    const pricing = await calculateDynamicPrice({
      service,
      providerId,
      startTime,
    });

    const booking = await Booking.create(
      {
        customer_id: req.user.id,
        service_id,
        provider_id: providerId,
        slot_id: slot ? slot.id : null,
        start_time: startTime,
        end_time: endTime,
        buffer_end_time: bufferEnd,
        total_price: pricing.total_price,
        status: "pending",
        payment_status: "unpaid",
      },
      { transaction },
    );

    if (slot) {
      await syncSlotStatus(slot.id, transaction);
    }

    await transaction.commit();

    res.status(201).json({
      message: "Booking berhasil dibuat",
      data: {
        booking,
        pricing,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const where = {};

    if (req.user.role === "customer") {
      where.customer_id = req.user.id;
    }

    if (req.user.role === "provider") {
      where.provider_id = req.user.id;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    const bookings = await Booking.findAll({
      where,
      include: bookingIncludes,
      order: [["start_time", "DESC"]],
    });

    res.json({
      message: "Histori booking",
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: bookingIncludes,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    if (!canAccessBooking(req.user, booking)) {
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    res.json({
      message: "Detail booking",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put(
  "/:id",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Status booking tidak valid" });
      }

      const booking = await Booking.findByPk(req.params.id);

      if (!booking) {
        return res.status(404).json({
          message: "Booking tidak ditemukan",
        });
      }

      if (!canManageBooking(req.user, booking)) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      await booking.update({
        status,
      });

      res.json({
        message: "Status booking berhasil diupdate",
        data: booking,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

router.patch("/:id/cancel", verifyToken, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const booking = await Booking.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    if (!canAccessBooking(req.user, booking)) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    if (booking.status === "completed") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Booking yang sudah selesai tidak bisa dibatalkan",
      });
    }

    await booking.update(
      {
        status: "cancelled",
        cancellation_reason: req.body.reason || null,
        payment_status:
          booking.payment_status === "paid" ? "refunded" : booking.payment_status,
      },
      { transaction },
    );

    if (booking.slot_id) {
      await syncSlotStatus(booking.slot_id, transaction);
    }

    if (booking.payment_status === "paid") {
      await Payment.update(
        { status: "refunded" },
        {
          where: { booking_id: booking.id, status: "paid" },
          transaction,
        },
      );
    }

    await transaction.commit();

    res.json({
      message: "Booking berhasil dibatalkan",
      data: booking,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const booking = await Booking.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    if (!canAccessBooking(req.user, booking)) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    if (booking.status === "completed") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Booking yang sudah selesai tidak bisa dibatalkan",
      });
    }

    await booking.update(
      {
        status: "cancelled",
        cancellation_reason:
          req.body.reason || "Dibatalkan melalui endpoint DELETE",
        payment_status:
          booking.payment_status === "paid" ? "refunded" : booking.payment_status,
      },
      { transaction },
    );

    if (booking.slot_id) {
      await syncSlotStatus(booking.slot_id, transaction);
    }

    if (booking.payment_status === "paid") {
      await Payment.update(
        { status: "refunded" },
        {
          where: { booking_id: booking.id, status: "paid" },
          transaction,
        },
      );
    }

    await transaction.commit();

    res.json({
      message: "Booking berhasil dibatalkan",
      data: booking,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
