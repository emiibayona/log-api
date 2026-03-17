
function applyExtraSetup(sequelize) {
  const { User, Tenant, UserTenant } = sequelize.models;

  // Relación Muchos a Muchos
  User.belongsToMany(Tenant, { 
    through: UserTenant,
    foreignKey: 'userId',
    otherKey: 'tenantId'
  });

  Tenant.belongsToMany(User, { 
    through: UserTenant,
    foreignKey: 'tenantId',
    otherKey: 'userId'
  });
}

module.exports = { applyExtraSetup };
