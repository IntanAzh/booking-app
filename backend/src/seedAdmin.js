require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./config/database");

// Import all models to ensure schema sync
const User = require("./models/user");
require("./models/category");
require("./models/service");
require("./models/serviceVariant");
require("./models/staffSpeciality");
require("./models/serviceSchedule");
require("./models/timeSlot");
require("./models/booking");
require("./models/payment");
require("./models/pricingRule");

async function seedAdmin() {
  try {
    console.log("Resetting database (dropping all existing tables)...");
    
    // Force sync drops all tables and recreates them clean
    await sequelize.sync({ force: true });
    console.log("Database tables reset successfully.");

    const adminEmail = "admin@bookingapp.com";
    const adminPasswordRaw = "admin123456";
    const hashedPassword = await bcrypt.hash(adminPasswordRaw, 10);

    const adminUser = await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("=========================================");
    console.log("ADMIN SEED CREATED SUCCESSFULLY!");
    console.log("-----------------------------------------");
    console.log(`ID       : ${adminUser.id}`);
    console.log(`Name     : ${adminUser.name}`);
    console.log(`Email    : ${adminUser.email}`);
    console.log(`Password : ${adminPasswordRaw}`);
    console.log(`Role     : ${adminUser.role}`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  }
}

seedAdmin();
