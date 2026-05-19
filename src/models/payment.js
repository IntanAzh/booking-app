const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking = require("./booking");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    method: {
      type: DataTypes.ENUM("cash", "transfer", "ewallet", "card"),
      defaultValue: "transfer",
    },

    status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },

    transaction_ref: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  },
);

Booking.hasMany(Payment, {
  foreignKey: "booking_id",
  as: "payments",
});

Payment.belongsTo(Booking, {
  foreignKey: "booking_id",
  as: "booking",
});

module.exports = Payment;
