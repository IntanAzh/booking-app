require("dotenv").config();

const express = require("express");
const app = express();

// import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");

// import database connection
const sequelize = require("./config/database");


// middleware

app.use(express.json());


// routes

app.get("/", (req, res) => {
  res.send("Backend sudah jalan 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);


// database connection & server start

sequelize
  .sync({ alter: true })
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
