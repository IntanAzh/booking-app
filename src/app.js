require("dotenv").config();

const express = require("express");
const app = express();

// import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const serviceRoutes = require("./routes/services");
const bookingRoutes = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");
const providerRoutes = require("./routes/providers");
const scheduleRoutes = require("./routes/schedules");
const slotRoutes = require("./routes/slots");
const paymentRoutes = require("./routes/payments");
const pricingRoutes = require("./routes/pricing");

// import database connection
const sequelize = require("./config/database");
require("./models/category");
require("./models/user");
require("./models/service");
require("./models/serviceVariant");
require("./models/staffSpeciality");
require("./models/serviceSchedule");
require("./models/timeSlot");
require("./models/booking");
require("./models/payment");
require("./models/pricingRule");

// middleware
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("Backend sudah jalan 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/dashboard", dashboardRoutes);

const syncOptions = process.env.DB_SYNC_ALTER === "true" ? { alter: true } : {};

// database connection & server start
sequelize
  .sync(syncOptions)
  .then(() => {
    console.log("Database connected");

    // jalankan server setelah database berhasil terkoneksi
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database error:", err);
  });
