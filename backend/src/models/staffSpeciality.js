const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user");
const Service = require("./service");

const StaffSpeciality = sequelize.define(
  "StaffSpeciality",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "staff_specialities",
    timestamps: true,
  },
);

// relasi user dan service melalui staff speciality

User.belongsToMany(Service, {
  through: StaffSpeciality,
  foreignKey: "staff_id",
  otherKey: "service_id",
  as: "specialities",
});

Service.belongsToMany(User, {
  through: StaffSpeciality,
  foreignKey: "service_id",
  otherKey: "staff_id",
  as: "staff",
});

module.exports = StaffSpeciality;
