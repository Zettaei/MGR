const { DataTypes } = require("sequelize");
const db = require("../db");

const GameReviewsModel = db.pgConnection.define("gameReviews",
{
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gameId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    recommended: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    review: {
        type: DataTypes.TEXT,
        allowNull: false
    }
},
{
    indexes: [
        {
            fields: ["user_id", "gameId"]
        }
    ]
}
);

GameReviewsModel.sync({ alter: db.alter });

module.exports = GameReviewsModel;