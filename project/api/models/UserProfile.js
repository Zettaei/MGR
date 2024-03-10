const { DataTypes, TEXT } = require("sequelize");
const db = require("../db");

const UserProfile = db.pgConnection.define("userProfiles", {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    aboutMe: {
        type: DataTypes.TEXT
    }
},
{
    createdAt: false,
    updatedAt: true
});

UserProfile.sync({ alter: db.alter });
module.exports = UserProfile;