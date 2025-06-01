const { ResultError } = require("../services/HandleResponse");

const withTryCatch = function (
  func,
  { errorFn, errorPrefix = "Something went wrong" } = {}
) {
  return async function (...params) {
    try {
      return await func(...params);
    } catch (error) {
      if (errorFn) {
        return errorFn(error);
      }
      return ResultError({ error: errorPrefix + ": " + error });
    }
  };
};

module.exports = { withTryCatch };
