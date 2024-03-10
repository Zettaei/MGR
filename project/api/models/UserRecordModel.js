const { DataTypes } = require("sequelize");
const db = require("../db");

const UserRecordModel = db.pgConnection.define("userRecords", {
    userRecordGame_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
    },
    duplicated: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    playtime: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    platformId: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    platformStore_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    finishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    createdAt: true,
    updatedAt: true
})

UserRecordModel.sync({ alter: db.alter });
module.exports = UserRecordModel;