require("pg").defaults.parseInt8 = true;
const { Sequelize } = require("sequelize");
require("dotenv").config();

// DB_NAME="db_myproject"
// DB_USERNAME="zt"
// DB_PASSWORD="0000"
// DB_HOST="localhost"

const alter = process.env.DB_ALTER.toLowerCase() === "true" ? true : false;

const pgConnection = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        logging: false,
        host: process.env.DB_HOST,
        dialect: "postgres",
    }, {
        defaults: {
            parseInt8: true,
        }
    });

module.exports = { pgConnection, alter };