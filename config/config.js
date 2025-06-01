const path = require("path");

module.exports = {
  development: {
    username: "plannlgo_log_db",
    password: "log_dblog_db",
    database: path.join(__dirname, "plannlgo_log_db"),
    host: "localhost",
    dialect: "mysql",
    logging: true,
    operatorsAliases: false,
  },
};
