const { Op } = require("../config/database");
const withLimit = function (query) {
  return {
    limit: query?.limit || 20,
    offset: query?.offset || 0,
  };
};
const oneParameter = function (search) {
  if (!Op) return null;
  if (!search) return null;
  return {
    [Op.like]: `%${search}%`,
  };
};

const getParamters = function (arr) {
  if (!Op) return {};
  const orrr = arr
    .map((x) => {
      if (x) {
        return oneParameter(x);
      }
      return null;
    })
    .filter((x) => x);
  if (orrr.length) {
    return {
      [Op.or]: orrr,
    };
  } else return null;
};
module.exports = { withLimit, getParamters };
