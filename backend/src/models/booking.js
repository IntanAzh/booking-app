const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user");
const Service = require("./service");
const TimeSlot = require("./timeSlot");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    slot_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    buffer_end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
      defaultValue: "pending",
    },

    payment_status: {
      type: DataTypes.ENUM("unpaid", "paid", "refunded"),
      defaultValue: "unpaid",
    },

    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "bookings",
    timestamps: true,
  },
);

//relasi user -> booking

User.hasMany(Booking, {
  foreignKey: "customer_id",
  as: "bookings",
});

Booking.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customer",
});

User.hasMany(Booking, {
  foreignKey: "provider_id",
  as: "provider_bookings",
});

Booking.belongsTo(User, {
  foreignKey: "provider_id",
  as: "provider",
});


// relasi service -> booking
Service.hasMany(Booking, {
  foreignKey: "service_id",
  as: "bookings",
});

Booking.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

TimeSlot.hasMany(Booking, {
  foreignKey: "slot_id",
  as: "bookings",
});

Booking.belongsTo(TimeSlot, {
  foreignKey: "slot_id",
  as: "slot",
});

module.exports = Booking;
