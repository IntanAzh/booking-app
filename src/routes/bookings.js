const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Service = require("../models/service");
const User = require("../models/user");

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// create booking (customer yang buat booking) - dynamic pricing: weekend surcharge 20%, buffer end time 15 menit setelah end_time untuk antisipasi keterlambatan provider

router.post("/", verifyToken, checkRole(["customer"]), async (req, res) => {
  try {
    const { service_id, start_time, end_time } = req.body;

    // validasi input
    if (!service_id || !start_time || !end_time) {
      return res.status(400).json({
        message: "Semua data wajib diisi",
      });
    }

    // cek apakah service_id valid
    const service = await Service.findByPk(service_id);

    if (!service) {
      return res.status(404).json({
        message: "Service tidak ditemukan",
      });
    }

    // validasi slot waktu (tidak boleh bentrok dengan booking lain yang statusnya pending atau confirmed)
    const existingBooking = await Booking.findOne({
      where: {
        service_id,
        start_time,
        status: ["pending", "confirmed"],
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Slot waktu sudah dibooking",
      });
    }

    // dynamic pricing: weekend surcharge 20%
    let totalPrice = parseFloat(service.price);

    const bookingDate = new Date(start_time);
    const day = bookingDate.getDay();

    // weekend surcharge 20%
    if (day === 0 || day === 6) {
      totalPrice = totalPrice * 1.2;
    }

    // buffer end time 15 menit setelah end_time untuk antisipasi keterlambatan provider
    const bufferEnd = new Date(end_time);
    bufferEnd.setMinutes(bufferEnd.getMinutes() + 15);

    //create booking
    const booking = await Booking.create({
      customer_id: req.user.id,
      service_id,
      start_time,
      end_time,
      buffer_end_time: bufferEnd,
      total_price: totalPrice,
      status: "pending",
    });

    res.status(201).json({
      message: "Booking berhasil dibuat",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// get all bookings (admin bisa lihat semua, customer hanya bisa lihat booking sendiri)

router.get("/", verifyToken, async (req, res) => {
  try {
    let bookings;

    // admin bisa lihat semua booking, customer hanya bisa lihat booking sendiri
    if (req.user.role === "admin") {
      bookings = await Booking.findAll({
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["id", "name", "email"],
          },
          {
            model: Service,
            as: "service",
          },
        ],
      });
    } else {
      // customer hanya bisa lihat booking sendiri
      bookings = await Booking.findAll({
        where: {
          customer_id: req.user.id,
        },

        include: [
          {
            model: Service,
            as: "service",
          },
        ],
      });
    }

    res.json({
      message: "Data booking",
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//get booking by ID

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Service,
          as: "service",
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    //validasi owner
    if (req.user.role !== "admin" && booking.customer_id !== req.user.id) {
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

// Update booking status (confirm, complete, cancel) - hanya admin dan provider yang bisa update status

router.put(
  "/:id",
  verifyToken,
  checkRole(["admin", "provider"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      const booking = await Booking.findByPk(req.params.id);

      if (!booking) {
        return res.status(404).json({
          message: "Booking tidak ditemukan",
        });
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

// cancel booking (soft delete)

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    // validasi owner
    if (req.user.role !== "admin" && booking.customer_id !== req.user.id) {
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    await booking.update({
      status: "cancelled",
    });

    res.json({
      message: "Booking berhasil dibatalkan",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
