const { DataTypes } = require("sequelize");
const db = require("../db");
const { authConfig } = require("../config");

const UserModel = db.pgConnection.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(authConfig.MAX_USERNAME_LENGTH),
        allowNull: false
    },
    tag: {
        type: DataTypes.STRING(authConfig.TAG_LENGTH),
        allowNull: false
    },
    password: {
        type: DataTypes.BLOB,
        allowNull: false
    },
},
    {
        createdAt: true,
        updatedAt: true,
    }
);

UserModel.sync({ alter: db.alter });
module.exports = UserModel;