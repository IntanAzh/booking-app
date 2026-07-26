const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user");
const Service = require("./service");

const TimeSlot = sequelize.define(
  "TimeSlot",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    slot_date: {
      type: DataTypes.DATEONLY,
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

    status: {
      type: DataTypes.ENUM("available", "booked", "blocked"),
      defaultValue: "available",
    },

    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: "time_slots",
    timestamps: true,
  },
);

User.hasMany(TimeSlot, {
  foreignKey: "provider_id",
  as: "time_slots",
});

TimeSlot.belongsTo(User, {
  foreignKey: "provider_id",
  as: "provider",
});

Service.hasMany(TimeSlot, {
  foreignKey: "service_id",
  as: "time_slots",
});

TimeSlot.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

module.exports = TimeSlot;
