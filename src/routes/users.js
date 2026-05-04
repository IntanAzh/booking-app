const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");


// Get all users (Admin Only)

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
    res.status(500).json({ message: error.message });
  }
});


// get user by id (Admin & User sendiri)

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({
      message: "Detail user",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// update user (Admin Only)

router.put("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const { name, role } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    await user.update({ name, role });

    res.json({
      message: "User berhasil diupdate",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// delete user (Admin Only)

router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    await user.destroy();

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
