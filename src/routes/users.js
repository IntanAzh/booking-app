const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "createdAt"],
    });

    res.json({
      message: "Data semua user",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// =======================
// get user by id (detail user)
// ADMIN bisa lihat semua
// USER hanya bisa lihat dirinya sendiri
// =======================
router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id != req.params.id) {
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    res.json({
      message: "Detail user",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// update user (name, role) addmin only
router.put("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const { name, role } = req.body;

    // validasi input
    if (!name || !role) {
      return res.status(400).json({
        message: "Name dan role wajib diisi",
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    // update user
    await user.update({
      name,
      role,
    });

    res.json({
      message: "User berhasil diupdate",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// delete user addmin only
router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    await user.destroy();

    res.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// EXPORT
module.exports = router;
