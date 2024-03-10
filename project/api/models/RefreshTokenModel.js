const { DataTypes } = require("sequelize");
const db = require("../db");

const RefreshTokenModel = db.pgConnection.define("refreshTokens", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    extraId: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        primaryKey: true 
    },
    token: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
},
    {
        createdAt: true,
        updatedAt: false,
        indexes: [
            {
                fields: ["token"],
                unique: true
            }
        ]
    }
);

RefreshTokenModel.sync({ alter: db.alter });

module.exports = RefreshTokenModel;