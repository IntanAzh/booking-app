const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Payment = require("../models/payment");
const { verifyToken } = require("../middlewares/authMiddleware");

const canAccessBooking = (user, booking) => {
  if (!booking) return false;

  return (
    user.role === "admin" ||
    Number(user.id) === Number(booking.customer_id) ||
    Number(user.id) === Number(booking.provider_id)
  );
};

router.post("/simulate", verifyToken, async (req, res) => {
  try {
    const { booking_id, method, force_status } = req.body;

    if (!booking_id) {
      return res.status(400).json({ message: "booking_id wajib diisi" });
    }

    const booking = await Booking.findByPk(booking_id);

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    if (!canAccessBooking(req.user, booking)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Booking yang dibatalkan tidak bisa dibayar" });
    }

    const status = force_status === "failed" ? "failed" : "paid";
    const payment = await Payment.create({
      booking_id,
      amount: booking.total_price,
      method: method || "transfer",
      status,
      transaction_ref: `SIM-${Date.now()}-${booking.id}`,
      paid_at: status === "paid" ? new Date() : null,
    });

    if (status === "paid") {
      await booking.update({
        payment_status: "paid",
        status: booking.status === "pending" ? "confirmed" : booking.status,
      });
    }

    res.status(201).json({
      message:
        status === "paid"
          ? "Simulasi pembayaran berhasil"
          : "Simulasi pembayaran gagal",
      data: {
        payment,
        booking,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const include = [{ model: Booking, as: "booking" }];
    const payments = await Payment.findAll({
      include,
      order: [["createdAt", "DESC"]],
    });

    const data =
      req.user.role === "admin"
        ? payments
        : payments.filter((payment) => canAccessBooking(req.user, payment.booking));

    res.json({
      message: "Data pembayaran",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
