function applyExtraSetup(sequelize) {
  // const { Address, Peoples, Center, Entity, PayPlan, Due, Payment } =
  //   sequelize.models;

  // Center.belongsTo(Address, {
  //   foreignKey: "addressId",
  //   targetKey: "id",
  // });

  // // Peoples
  // Peoples.belongsTo(Address, {
  //   foreignKey: "addressId",
  //   targetKey: "id",
  // });

  // // M:N Peoples_Centers
  // Peoples.belongsToMany(Center, { through: "Peoples_Centers" });
  // Center.belongsToMany(Peoples, { through: "Peoples_Centers" });

  // // Entity
  // Entity.belongsTo(Address, {
  //   foreignKey: "addressId",
  //   targetKey: "id",
  // });

  // // Payplan
  // PayPlan.belongsTo(Peoples, {
  //   foreignKey: "peopleId",
  //   targetKey: "id",
  // });
  // PayPlan.belongsTo(Center, {
  //   foreignKey: "centerId",
  //   targetKey: "id",
  // });
  // PayPlan.belongsTo(Entity, {
  //   foreignKey: "entityId",
  //   targetKey: "id",
  // });
  // PayPlan.hasMany(Due, {
  //   foreignKey: "payPlanId",
  //   targetKey: "id",
  // });

  // Payment.belongsTo(Peoples, {
  //   foreignKey: "peopleId",
  //   targetKey: "id",
  // });
  // Payment.belongsTo(Center, {
  //   foreignKey: "centerId",
  //   targetKey: "id",
  // });
  // Payment.belongsTo(Entity, {
  //   foreignKey: "entityId",
  //   targetKey: "id",
  // });
  // Payment.hasMany(Due, {
  //   foreignKey: "payPlanId",
  //   targetKey: "id",
  // });
}

module.exports = { applyExtraSetup };
