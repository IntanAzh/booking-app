const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user");
const Service = require("./service");

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


// relasi service -> booking


Service.hasMany(Booking, {
  foreignKey: "service_id",
  as: "bookings",
});

Booking.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

module.exports = Booking;
