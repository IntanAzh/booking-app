const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Service = require("../models/service");
const User = require("../models/user");

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const { Sequelize } = require("sequelize");

// Admin dashboard - statistik users, services, bookings, revenue, dll

router.get("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    // total users
    const totalUsers = await User.count();

    const totalCustomers = await User.count({
      where: {
        role: "customer",
      },
    });

    const totalProviders = await User.count({
      where: {
        role: "provider",
      },
    });

    // total services
    const totalServices = await Service.count();

    // total bookings
    const totalBookings = await Booking.count();

    // booking status breakdown
    const pendingBookings = await Booking.count({
      where: {
        status: "pending",
      },
    });

    const confirmedBookings = await Booking.count({
      where: {
        status: "confirmed",
      },
    });

    const completedBookings = await Booking.count({
      where: {
        status: "completed",
      },
    });

    const cancelledBookings = await Booking.count({
      where: {
        status: "cancelled",
      },
    });

    // total revenue (hanya hitung booking yang statusnya completed)
    const revenueResult = await Booking.sum("total_price", {
      where: {
        status: "completed",
      },
    });

    const totalRevenue = revenueResult || 0;

    // layanan paling banyak dipesan (top 5)
    const topServices = await Booking.findAll({
      attributes: [
        "service_id",
        [Sequelize.fn("COUNT", Sequelize.col("service_id")), "total_bookings"],
      ],

      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "price"],
        },
      ],

      group: ["service_id"],

      order: [[Sequelize.literal("total_bookings"), "DESC"]],

      limit: 5,
    });

    // response dashboard
    res.json({
      message: "Dashboard Admin",

      data: {
        users: {
          total_users: totalUsers,
          total_customers: totalCustomers,
          total_providers: totalProviders,
        },

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
