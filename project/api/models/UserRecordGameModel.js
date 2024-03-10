const { DataTypes } = require("sequelize");
const db = require("../db");

const UserRecordGameModel = db.pgConnection.define("userRecordGames", {
    id: {
        type: DataTypes.BIGINT,
        unique: true,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    gameId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    score: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    createdAt: true,
    updatedAt: true
})

UserRecordGameModel.sync({ alter: db.alter });
module.exports = UserRecordGameModel;