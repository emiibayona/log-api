const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
const path = require("path");
const { applyExtraSetup } = require("./extra-setup.js");
const fs = require("fs");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
  host: "localhost",
  dialect: "sqlite",
  logging: true,
  operatorsAliases: false,
});

// const sequelize = new Sequelize({
//   username: "root",
//   password: "root",
//   database: path.join(__dirname, "database.sqlite"),
//   host: "localhost",
//   dialect: "sqlite",
//   logging: true,
//   operatorsAliases: false,
// });

const db = {
  Sequelize,
  sequelize,
  DataTypes,
  QueryTypes,
  Op: Sequelize.Op,
};

fs?.readdirSync("./models/")?.forEach((file) => {
  if (!file.startsWith(".") && file.endsWith(".js") && db) {
    db[file.split(".")[0]] = require(`../models/${file}`)(sequelize, DataTypes);
  }
});

applyExtraSetup(sequelize);

module.exports = db;
