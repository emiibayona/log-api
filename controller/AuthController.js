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
  return handleResponse(await service.get(req.user, true), res);
};

controller.getUserOrCreate = async (req, res) => {
  try{
    const result = await service.getOrCreate(req.user || req, req.fromProfile);
    if (res) {
      return handleResponse(result, res);
    } else {
      return result.value;
    }
   }catch(error){
    res.status(500).json({error})
  }
};

controller.update = async (req, res) => {
  return handleResponse(await service.update(req.body), res);
};

module.exports = controller;