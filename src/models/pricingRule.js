const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PricingRule = sequelize.define(
  "PricingRule",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    rule_type: {
      type: DataTypes.ENUM("weekend", "peak_hour", "demand"),
      allowNull: false,
    },

    adjustment_type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      defaultValue: "percentage",
    },

    adjustment_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    conditions: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "pricing_rules",
    timestamps: true,
  },
);

module.exports = PricingRule;
