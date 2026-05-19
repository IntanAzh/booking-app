const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user");
const Service = require("./service");

const ServiceSchedule = sequelize.define(
  "ServiceSchedule",
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

    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "service_schedules",
    timestamps: true,
  },
);

User.hasMany(ServiceSchedule, {
  foreignKey: "provider_id",
  as: "service_schedules",
});

ServiceSchedule.belongsTo(User, {
  foreignKey: "provider_id",
  as: "provider",
});

Service.hasMany(ServiceSchedule, {
  foreignKey: "service_id",
  as: "schedules",
});

ServiceSchedule.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

module.exports = ServiceSchedule;
