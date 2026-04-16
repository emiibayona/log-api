const { withTryCatch } = require("../utils/tryCatch");
const { WrapResults, ResultError, handleResponse } = require("./HandleResponse");

const { User, Tenant, UserTenant, sequelize } = require("../config/database");
const { USER_TYPE, STATUS } = require("../utils/constants");
const jwt = require("jsonwebtoken"); // Asegúrate de tenerlo instalado
const bcrypt = require('bcrypt');

const service = {};
let transaction = null;

const parseUser = (info) => {
  const data = info?._json || info;

  return {
    email: data.email,
    name: data.given_name || data.name,
    lastname: data.family_name || data.lastname,
    picture: data.picture,
    settings: data.settings || JSON.stringify({}),
    tenant: info.tenant,
    googleId: data.sub || data.id || data.user,
    id: data.id,
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

async function addTenantToUser(user, tenant, role = USER_TYPE.USER) {
  const tt = await Tenant.findOne({ where: { slug: tenant } });
  await user.addTenant(tt, {
    through:
      { role: USER_TYPE.USER, status: STATUS.ACTIVE }
  });
}

service.create = withTryCatch(
  async function (data) {
    const parsedUser = parseUser(data);
    const user = await User.findOne({ where: { googleId: parsedUser?.googleId } })
    if (!user) {
      user = await User.create(parsedUser);
    }
    await addTenantToUser(user, parsedUser.tenant);
    delete user.password;
    return WrapResults(res);
  },
  {
    errorPrexfix: "Error creating user",
  }
);

service.createNotGoogle = withTryCatch(
  async function (data) {
    const { email, password, tenant, userInfo, role } = data;

    // 1. Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: { email },
      // include: [{where:{slug:},association: 'UserTenants'}]
      include: [{
        model: Tenant,
        where: {
          slug: tenant, // Aquí aplicas el filtro del Tenant
        },
        required: true, // Esto convierte la consulta en un INNER JOIN
        through: {
          attributes: ['status', 'role'] // Agrega aquí el campo 'status'
        },
      }]
    });

    if (existingUser) {
      throw 'El email ya está registrado para este sitio.';
    }

    // 2. Cifrar contraseña (Salt rounds = 10 es lo ideal por balance seguridad/velocidad)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear usuario
    const newUser = await User.create({
      ...userInfo,
      email,
      password: hashedPassword,
    });
    if (newUser)
      await addTenantToUser(newUser, tenant || 'geartown', role);

    return WrapResults(newUser);
  },
  {
    errorPrexfix: "Error creating user",
  }
);

service.getOrCreate = withTryCatch(
  async function (params, fromProfile = false) {
    const user = await service.get(fromProfile ? params : parseUser(params), fromProfile);
    if (user?.success && user?.value) {
      delete user?.value?.password;
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
    const user = await service.get(params, true);
    if (user?.success && !user?.value || user?.error) {
      throw user;
    }

    await User.update(parseUser(params), { where: { id: user.value.id } })

    return WrapResults(
      parseUser(params)
    );
  },
  {
    error: "Error updating the user",
  }
);

service.login = withTryCatch(
  async function (body) {
    const { email, password, tenant, redirect } = body;

    // 1. Buscar usuario
    const user = await User.findOne({
      where: { email },
      // include: [{where:{slug:},association: 'UserTenants'}]
      include: [{
        model: Tenant,
        where: {
          slug: tenant, // Aquí aplicas el filtro del Tenant
        },
        required: true, // Esto convierte la consulta en un INNER JOIN
        through: {
          attributes: ['status', 'role'] // Agrega aquí el campo 'status'
        },
      }]
    });

    if (!user) {
      throw 'Cuenta no existente'
    }

    // 2. Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw 'Credenciales inválidas.';
    }

    // 3. Generar JWT (Usando tu JWT_SECRET de las variables de entorno)
    const token = jwt.sign(
      { id: user.id, email: user.email, tenant: tenant },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return WrapResults({
      message: 'Login exitoso',
      token,
      user: { id: user.id, email: user.email },
      timestamp: Date.now(),
      redirect
    });

  }
);
module.exports = service;
