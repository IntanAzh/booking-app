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

router.get("/", verifyToken, async (req, res) => {
  try {
    const where = {};

    if (req.user.role === "customer") {
      where.customer_id = req.user.id;
    } else if (req.user.role === "provider") {
      where.provider_id = req.user.id;
    } else if (req.query.customer_id) {
      where.customer_id = req.query.customer_id;
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
      message: "Data booking saya",
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
