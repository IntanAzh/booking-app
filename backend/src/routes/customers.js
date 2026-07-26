const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Service = require("../models/service");
const TimeSlot = require("../models/timeSlot");
const User = require("../models/user");
const { verifyToken } = require("../middlewares/authMiddleware");

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

router.get("/:id/booking-history", verifyToken, async (req, res) => {
  try {
    const customerId = Number(req.params.id);

    if (req.user.role !== "admin" && Number(req.user.id) !== customerId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const customer = await User.findOne({
      where: {
        id: customerId,
        role: "customer",
      },
      attributes: ["id", "name", "email", "role"],
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    const bookings = await Booking.findAll({
      where: {
        customer_id: customerId,
      },
      include: bookingIncludes,
      order: [["start_time", "DESC"]],
    });

    res.json({
      message: "Histori booking customer",
      data: {
        customer,
        bookings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
