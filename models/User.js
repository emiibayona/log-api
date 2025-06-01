const { STATUS, USER_TYPE } = require("../utils/constants");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("Users", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    settings: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.values(STATUS),
      allowNull: false,
      defaultValue: "active",
    },
    type: {
      type: DataTypes.ENUM,
      values: Object.values(USER_TYPE),
      allowNull: false,
      defaultValue: USER_TYPE.OTHER,
    },
  });

  return User;
};
