const { USER_TYPE, STATUS } = require("../utils/constants");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("UserTenant", {
    role: {
      type: DataTypes.ENUM,
      values: Object.values(USER_TYPE),
      allowNull: false,
      defaultValue: USER_TYPE.OTHER,
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.values(STATUS),
      allowNull: false,
      defaultValue: STATUS.ACTIVE,
    },
  });
};