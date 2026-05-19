const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Service = require("../models/service");
const User = require("../models/user");

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const { Sequelize } = require("sequelize");

// Dashboard statistik users, services, bookings, revenue, dll

router.get("/", verifyToken, checkRole(["admin", "provider"]), async (req, res) => {
  try {
    const bookingScope =
      req.user.role === "provider" ? { provider_id: req.user.id } : {};
    const serviceScope =
      req.user.role === "provider" ? { provider_id: req.user.id } : {};

    // total users
    const totalUsers = req.user.role === "admin" ? await User.count() : null;

    const totalCustomers =
      req.user.role === "admin"
        ? await User.count({
            where: {
              role: "customer",
            },
          })
        : null;

    const totalProviders =
      req.user.role === "admin"
        ? await User.count({
            where: {
              role: "provider",
            },
          })
        : null;

    // total services
    const totalServices = await Service.count({
      where: serviceScope,
    });

    // total bookings
    const totalBookings = await Booking.count({
      where: bookingScope,
    });

    // booking status breakdown
    const pendingBookings = await Booking.count({
      where: {
        ...bookingScope,
        status: "pending",
      },
    });

    const confirmedBookings = await Booking.count({
      where: {
        ...bookingScope,
        status: "confirmed",
      },
    });

    const completedBookings = await Booking.count({
      where: {
        ...bookingScope,
        status: "completed",
      },
    });

    const cancelledBookings = await Booking.count({
      where: {
        ...bookingScope,
        status: "cancelled",
      },
    });

    // total revenue hitung booking completed yang sudah paid.
    const revenueResult = await Booking.sum("total_price", {
      where: {
        ...bookingScope,
        status: "completed",
        payment_status: "paid",
      },
    });

    const totalRevenue = revenueResult || 0;

    // layanan paling banyak dipesan (top 5)
    const topServices = await Booking.findAll({
      attributes: [
        "service_id",
        [Sequelize.fn("COUNT", Sequelize.col("service_id")), "total_bookings"],
        [Sequelize.fn("SUM", Sequelize.col("total_price")), "total_revenue"],
      ],

      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "price"],
        },
      ],

      where: bookingScope,

      group: ["Booking.service_id", "service.id", "service.name", "service.price"],

      order: [[Sequelize.literal("total_bookings"), "DESC"]],

      limit: 5,
    });

    // response dashboard
    res.json({
      message: req.user.role === "admin" ? "Dashboard Admin" : "Dashboard Provider",

      data: {
        users:
          req.user.role === "admin"
            ? {
                total_users: totalUsers,
                total_customers: totalCustomers,
                total_providers: totalProviders,
              }
            : undefined,

        services: {
          total_services: totalServices,
        },

        bookings: {
          total_bookings: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },

        revenue: {
          total_revenue: totalRevenue,
        },

        top_services: topServices,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
