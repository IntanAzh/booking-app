const express = require("express");
const router = express.Router();

// Noted kalau mau import di atas semua
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// Test route

router.get("/", (req, res) => {
  res.json({ message: "Auth route aktif" });
});

// Register

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // cek email sudah ada
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    res.json({
      message: "Register berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login 

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Profil

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Profile berhasil diakses",
    user: req.user,
  });
});


// Admin Only 

router.get("/admin", verifyToken, checkRole(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

// EXPORT HARUS DI PALING BAWAH
module.exports = router;
