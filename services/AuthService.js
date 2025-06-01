const { withTryCatch } = require("../utils/tryCatch");
const { WrapResults, ResultError } = require("./HandleResponse");

const { User } = require("../config/database");

const service = {};

const parseUser = (info) => {
  const data = info?._json || info;

  return {
    id: data.sub || data.id || data.user,
    name: data.given_name,
    lastname: data.family_name,
    picture: data.picture,
    settings: data.settings || JSON.stringify({}),
  };
};

service.get = withTryCatch(
  async function (params) {
    const id = params?.user || params?.id;
    const user = await User.findOne({
      where: { id },
    });

    return WrapResults(user);
  },
  {
    error: "Error while fetching user",
  }
);

service.create = withTryCatch(
  async function (data) {
    const res = await User.create(parseUser(data));
    return WrapResults(res);
  },
  {
    error: "Error creating user",
  }
);

service.getOrCreate = withTryCatch(
  async function (params) {
    const user = await service.get(parseUser(params));
    if (user?.success && user?.value) {
      return WrapResults(user);
    } else {
      return service.create(params);
    }
  },
  {
    error: "Error fetching or creating the user",
  }
);

service.update = withTryCatch(
  async function (params) {
    const user = await service.get(params);
    if (user?.success && !user?.value) {
      throw user;
    }

    return WrapResults(
      await User.update(parseUser(params), { where: { id: user.id } })
    );
  },
  {
    error: "Error updating the user",
  }
);
module.exports = service;
