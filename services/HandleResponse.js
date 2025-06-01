const handleResponse = (value, res) => {
  if (value?.error) {
    res.status(500);
    return res.json(value);
  }
  return res.json(value?.value);
};

const ResultError = ({ error }) => {
  return { error, isValid: false, success: false };
};

const ResultOk = (value) => ({ value, isValid: true, success: true });

const WrapResults = (value) => {
  // TODO: process and transform value if UPDAATE response. [1]
  if (Array.isArray(value) && !Object.keys(value || {}).includes("count")) {
    return ResultOk({ rows: value, count: value.length });
  }
  return ResultOk(value);
};

module.exports = { handleResponse, ResultError, ResultOk, WrapResults };
