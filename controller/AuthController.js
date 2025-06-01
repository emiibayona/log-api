const { handleResponse } = require("../services/HandleResponse");
const service = require("../services/AuthService");
const controller = {};
controller.getList = async (req, res) => {
  //   return handleResponse(await service.getList(req.query), res);
  return handleResponse({}, res);
};

controller.create = async (req, res) => {
  return handleResponse(await service.create(req), res);
};

controller.getUser = async (req, res) => {
  return handleResponse(await service.get(req), res);
};

controller.getUserOrCreate = async (req, res) => {
  const body = Object.values(req.body)?.length
    ? req.body
    : req.session?.passport?.user;
  const result = await service.getOrCreate(body || {});
  if (res) {
    return handleResponse(result, res);
  } else {
    return result.value;
  }
};

controller.update = async (req, res) => {
  return handleResponse(await service.update(req.body), res);
};

module.exports = controller;
