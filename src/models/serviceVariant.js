const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Service = require("./service");

const ServiceVariant = sequelize.define(
  "ServiceVariant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    variant_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "service_variants",
    timestamps: true,
  },
);

// relasi service dan service variant

Service.hasMany(ServiceVariant, {
  foreignKey: "service_id",
  as: "variants",
});

ServiceVariant.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

module.exports = ServiceVariant;
