module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Tenant", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true, // ej: "geartown-shop"
    },
    baseUrl: {
      type: DataTypes.STRING,
    },
    
  });
};