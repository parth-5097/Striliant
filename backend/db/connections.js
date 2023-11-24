const mysql = require("mysql");
const HOSTNAME = "dev.cr72n5fpq5g8.us-east-1.rds.amazonaws.com";
const USER = "admin";
const PASSWORD = "himanshu123";
const DATABASE = "Striliant";

var pool = mysql.createPool({
  connectionLimit: 1000,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  host: HOSTNAME,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
  multipleStatements: true,
});

module.exports = pool;
