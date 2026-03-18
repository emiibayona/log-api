const { withTryCatch } = require("../utils/tryCatch");
const { WrapResults, ResultError } = require("./HandleResponse");

const { User, Tenant, UserTenant, sequelize } = require("../config/database");
const { USER_TYPE, STATUS } = require("../utils/constants");


const service = {};
let transaction = null;

const parseUser = (info) => {
  const data = info?._json || info;

  return {
    email: data.email,
    name: data.given_name,
    lastname: data.family_name,
    picture: data.picture,
    settings: data.settings || JSON.stringify({}),
    tenant: info.tenant,
    googleId: data.sub || data.id || data.user,
  };
};

service.get = withTryCatch(
  async function (params, fromProfile = false) {
    const id = params?.googleId || params?.user || params?.id;
    const user = await User.findOne({
      where: fromProfile ? { id } : { googleId: id },
      // include: [{where:{slug:},association: 'UserTenants'}]
      include: [{
        model: Tenant,
        where: {
          slug: params?.tenant, // Aquí aplicas el filtro del Tenant
        },
        required: true, // Esto convierte la consulta en un INNER JOIN
        through: {
          attributes: ['status', 'role'] // Agrega aquí el campo 'status'
        },
      }]
    });

    user.Tenant = user.Tenants.map(x => ({
      baseUrl: x.baseUrl, slug: x.slug,
      name: x.name,
      rol: x.UserTenant.role,
      status: x.UserTenant.status
    }))
    return WrapResults(user);
  },
  {
    error: "Error while fetching user",
  }
);

service.create = withTryCatch(
  async function (data) {
    const parsedUser = parseUser(data);
    const user = await User.findOne({ where: { googleId: parsedUser?.googleId } })
    if (!user) {
      user = await User.create(parsedUser, { transaction });
    }
    const tenant = await Tenant.findOne({ where: { slug: parsedUser.tenant } });
    await user.addTenant(tenant, {
      through:
        { role: USER_TYPE.USER, status: STATUS.ACTIVE }, transaction
    });

    return WrapResults(res);
  },
  {
    errorPrexfix: "Error creating user",
  }
);

service.getOrCreate = withTryCatch(
  async function (params, fromProfile = false) {
    const user = await service.get(fromProfile ? params : parseUser(params), fromProfile);
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
