const express = require("express");
const router = express.Router();

const { Sequelize } = require("sequelize");
const Booking = require("../models/booking");
const Service = require("../models/service");
const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const getScopes = (user) => ({
  bookingScope: user.role === "provider" ? { provider_id: user.id } : {},
  serviceScope: user.role === "provider" ? { provider_id: user.id } : {},
});

const getBookingStats = async (bookingScope = {}) => {
  const [total, pending, confirmed, completed, cancelled] = await Promise.all([
    Booking.count({ where: bookingScope }),
    Booking.count({ where: { ...bookingScope, status: "pending" } }),
    Booking.count({ where: { ...bookingScope, status: "confirmed" } }),
    Booking.count({ where: { ...bookingScope, status: "completed" } }),
    Booking.count({ where: { ...bookingScope, status: "cancelled" } }),
  ]);

  return {
    total_bookings: total,
    pending,
    confirmed,
    completed,
    cancelled,
  };
};

const getRevenueStats = async (bookingScope = {}) => {
  const totalRevenue =
    (await Booking.sum("total_price", {
      where: {
        ...bookingScope,
        status: "completed",
        payment_status: "paid",
      },
    })) || 0;

  const paidBookingCount = await Booking.count({
    where: {
      ...bookingScope,
      status: "completed",
      payment_status: "paid",
    },
  });

  return {
    total_revenue: totalRevenue,
    paid_completed_bookings: paidBookingCount,
  };
};

const getTopServices = async (bookingScope = {}) =>
  Booking.findAll({
    attributes: [
      "service_id",
      [Sequelize.fn("COUNT", Sequelize.col("Booking.service_id")), "total_bookings"],
      [Sequelize.fn("SUM", Sequelize.col("Booking.total_price")), "total_revenue"],
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

const buildDashboard = async (user) => {
  const { bookingScope, serviceScope } = getScopes(user);

  const [totalServices, bookingStats, revenueStats, topServices] =
    await Promise.all([
      Service.count({ where: serviceScope }),
      getBookingStats(bookingScope),
      getRevenueStats(bookingScope),
      getTopServices(bookingScope),
    ]);

  const data = {
    services: {
      total_services: totalServices,
    },
    bookings: bookingStats,
    revenue: revenueStats,
    top_services: topServices,
  };

  if (user.role === "admin") {
    const [totalUsers, totalCustomers, totalProviders] = await Promise.all([
      User.count(),
      User.count({ where: { role: "customer" } }),
      User.count({ where: { role: "provider" } }),
    ]);

    data.users = {
      total_users: totalUsers,
      total_customers: totalCustomers,
      total_providers: totalProviders,
    };
  }

  return data;
};

router.get("/", verifyToken, checkRole(["admin", "provider"]), async (req, res) => {
  try {
    const data = await buildDashboard(req.user);

    res.json({
      message: req.user.role === "admin" ? "Dashboard Admin" : "Dashboard Provider",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/admin", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const data = await buildDashboard(req.user);

    res.json({
      message: "Dashboard Admin",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/provider", verifyToken, checkRole(["provider"]), async (req, res) => {
  try {
    const data = await buildDashboard(req.user);

    res.json({
      message: "Dashboard Provider",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/revenue", verifyToken, checkRole(["admin", "provider"]), async (req, res) => {
  try {
    const { bookingScope } = getScopes(req.user);
    const revenue = await getRevenueStats(bookingScope);

    res.json({
      message: "Dashboard Revenue",
      data: revenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/bookings", verifyToken, checkRole(["admin", "provider"]), async (req, res) => {
  try {
    const { bookingScope } = getScopes(req.user);
    const bookings = await getBookingStats(bookingScope);

    res.json({
      message: "Dashboard Bookings",
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
