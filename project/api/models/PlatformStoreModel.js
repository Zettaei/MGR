const { DataTypes } = require("sequelize");
const db = require("../db");

const PlatformStoreModel = db.pgConnection.define("platformStore", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ["name"]
        }
    ]
});

PlatformStoreModel.sync({ alter: db.alter });
module.exports = PlatformStoreModel;