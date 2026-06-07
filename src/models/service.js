const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = require("./category");
const User = require("./user");

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "services",
    timestamps: true,
  },
);

// relasi antar service dan category

Category.hasMany(Service, {
  foreignKey: "category_id",
  as: "services",
});

Service.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

User.hasMany(Service, {
  foreignKey: "provider_id",
  as: "services",
});

Service.belongsTo(User, {
  foreignKey: "provider_id",
  as: "provider",
});

module.exports = Service;
