const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const {
  verifyToken,
  checkRole,
  blacklistToken,
} = require("../middlewares/authMiddleware");

// Test route untuk memastikan router ini aktif
router.get("/", (req, res) => {
  res.json({
    message: "Auth route aktif",
  });
});

// register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const allowedRoles = ["admin", "customer", "provider"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Role tidak valid",
      });
    }

    // validasi password (min 6 karakter, mengandung huruf besar dan kecil)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password harus terdiri dari minimal 6 karakter serta mengandung huruf besar dan huruf kecil",
      });
    }

    // cek email sudah terdaftar atau belum
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    const userRole = (role && allowedRoles.includes(role)) ? role : "customer";

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    res.status(201).json({
      message: "Register berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validasi input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    // cek user berdasarkan email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    // cek password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    // generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// profile & role-based routes
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role"],
    });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({
      message: "Profile berhasil diakses",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// logout semua role
router.post("/logout", verifyToken, (req, res) => {
  blacklistToken(req.token);

  res.json({
    message: "Logout berhasil",
  });
});

// admin only route
router.get("/admin", verifyToken, checkRole(["admin"]), (req, res) => {
  res.json({
    message: "Welcome Admin!",
  });
});

// provider only route
router.get("/provider", verifyToken, checkRole(["provider"]), (req, res) => {
  res.json({
    message: "Welcome Provider!",
  });
});

module.exports = router;
