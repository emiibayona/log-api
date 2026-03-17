const { Sequelize, DataTypes, QueryTypes, Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const mysql2 = require("mysql2");
const { applyExtraSetup } = require("./extra-setup.js");

let sequelize;

// 1. Configuración de la instancia según el entorno
if (process.env.SQL_TYPE === "sqlite") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "database.sqlite"),
    logging: false,
  });
} else if (process.env.SQL_TYPE === "mysql") {
  sequelize = new Sequelize("logApi", "root", "", {
    host: "localhost",
    dialect: "mysql",
    port: process.env.SQL_PORT || 3306,
  });
} else if (process.env.SQL_TYPE === "vercel") {
      sequelize = new Sequelize(process.env.TIDB_URL, {
        dialect: "mysql",
        dialectModule: mysql2,
        dialectOptions: {
          ssl: {
            rejectUnauthorized: true,
          },
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });
    }

const db = {
  Sequelize,
  sequelize,
  DataTypes,
  QueryTypes,
  Op
};

// 2. Carga de modelos (Sincrónica para asegurar la exportación)
const modelsPath = path.join(__dirname, "../models/"); // Asegúrate de que la ruta sea correcta
if (fs.existsSync(modelsPath)) {
  fs.readdirSync(modelsPath).forEach((file) => {
    if (!file.startsWith(".") && file.endsWith(".js")) {
      const modelName = file.split(".")[0];
      // Importante: pasar sequelize y DataTypes
      db[modelName] = require(path.join(modelsPath, file))(sequelize, DataTypes);
    }
  });
}

// 3. Aplicar relaciones (HasMany, etc)

// 4. Autenticación y Sincronización (Aquí es donde se crean las tablas)
// Usamos .then() para no bloquear la exportación pero asegurar que ocurra
applyExtraSetup(sequelize);

sequelize.authenticate()
.then(() => {
    console.log("✅ Connection established.");
    // alter: true actualiza las tablas si agregas columnas nuevas
    // return sequelize.sync({ force:true }); 
    return sequelize.sync({ alter:false }); 
  })
  .then(() => {
    console.log("✅ Tables synchronized/created.");
  })
  .catch(err => {
    console.error("❌ Database error:", err);
  });

module.exports = db;