const express = require("express");
const UserModel = require("../models/UserModel");
const UserProfileModel = require("../models/UserProfile");
const GameReviewsModel = require("../models/GameReviewsModel");
const UserRecordGameModel = require("../models/UserRecordGameModel");
const { authConfig, reviewsConfig, igdbConfig } = require("../config");
const Auth = require("../auth/auth");
const igdbToken = require("../igdb/token");
const { default: apicalypse } = require("apicalypse");

const app = express();
UserModel.hasOne(UserProfileModel, { foreignKey: "user_id" });
UserModel.hasMany(GameReviewsModel, { foreignKey: "user_id" });
UserModel.hasMany(UserRecordGameModel, { foreignKey: "user_id" });

app.post("/searchUser", async (req, res) => {
    try {

        const username = req.body.find.username;
        const tag = req.body.find.tag;

        if (!username || !tag) {
            return res.status(401).send({ message: "incorrect payload", error: "payload" });
        }

        const foundUser = await UserModel.findOne({
            where: {
                username,
                tag
            },
            attributes: ["username", "tag", "createdAt"]
        });

        res.send({ foundUser });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.get("/user/:username/:tag", async (req, res) => {
    try {
        const username = req.params.username;
        const tag = req.params.tag;

        if (!username || !tag) {
            return res.status(400).send({ message: "incorrect payload", error: "payload" });
        }

        const user = await UserModel.findOne({
            where: {
                username: username,
                tag: tag
            },
            attributes: ["id", "username", "tag"],
        });

        if (!user) {
            return res.status(204).send({ message: "No Record Found" });
        }

        let reviewsCount = GameReviewsModel.count({
            where: {
                user_id: user.id
            }
        });

        let gamesCount = UserRecordGameModel.count({
            where: {
                user_id: user.id
            }
        });

        let [find, isCreated] = await UserProfileModel.findOrCreate({
            where: {
                user_id: user.id
            },
            attributes: ["aboutMe", "updatedAt"],
            defaults: {
                aboutMe: ""
            }
        });

        console.log(find);

        await Promise.all([reviewsCount, gamesCount])
            .then((values) => {
                reviewsCount = values[0];
                gamesCount = values[1];
            });

        res.send({
            userProfile: Object.assign({
                username: user.username,
                tag: user.tag,
            }, find.dataValues),
            reviewsCount,
            gamesCount
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.get("/user/:username/:tag/reviews/:pageth", async (req, res) => {
    try {
        const username = req.params.username;
        const tag = req.params.tag;
        let pageth = Math.floor(req.params.pageth);

        if (!username || !tag) {
            return res.status(400).send({ message: "incorrect payload", error: "payload" });
        }

        if (!pageth || isNaN(pageth)) {
            return res.status(400).send({ message: "incorrect payload", error: "payload" });
        }
        if (pageth < 1) {
            pageth = 1;
        }

        const user = await UserModel.findOne({
            where: {
                username: username,
                tag: tag
            },
            attributes: ["id", "username", "tag"],
        });

        if (!user) {
            return res.status(204).send({ message: "no user found" });
        }

        const result = await GameReviewsModel.findAndCountAll({
            where: {
                user_id: user.id
            },
            attributes: ["id", "gameId", "recommended", "review", "updatedAt"],
            limit: reviewsConfig.REVIEWS_SEARCHED_PER_PAGE,
            offset: (pageth - 1) * reviewsConfig.REVIEWS_SEARCHED_PER_PAGE
        });

        if(result.rows.length === 0) {
            return res.status(200).send({
                user: { username: user.username, tag: user.tag },
                reviews: result.rows,
                reviewsCount: result.count,
                pageCount: 1,
                pageth: pageth
            });
        }

        let igdbResponse = [];
        for (let i = 0; i < 2; ++i) {
            try {
                let igdbAccessToken = await igdbToken.getIGDBtoken();

                const apicalypseOption = {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + igdbAccessToken,
                        "Client-ID": igdbConfig.CLIENT_ID
                    }
                }

                const ids = result.rows.map((userGame) => userGame.gameId);

                if (ids.length > 14) {
                    const response1 = apicalypse(apicalypseOption)
                        .fields("id, name, platforms.abbreviation, category, cover.url")
                        .where("id = (" + ids.slice(0, 7) + ")")
                        .request(igdbConfig.REQUEST_URL + "/games");

                    const response2 = apicalypse(apicalypseOption)
                        .fields("id, name, platforms.abbreviation, category, cover.url")
                        .where("id = (" + ids.slice(7, 13) + ")")
                        .request(igdbConfig.REQUEST_URL + "/games");

                    const response3 = apicalypse(apicalypseOption)
                        .fields("id, name, platforms.abbreviation, category, cover.url")
                        .where("id = (" + ids.slice(13,) + ")")
                        .request(igdbConfig.REQUEST_URL + "/games");

                    await Promise.all([response1, response2, response3])
                        .then((values) => {
                            igdbResponse.push(...values[0].data, ...values[1].data, ...values[2].data);
                        });
                }
                else if (ids.length > 7) {
                    const response1 = apicalypse(apicalypseOption)
                        .fields("id, name, platforms.abbreviation, category, cover.url")
                        .where("id = (" + ids.slice(0, 7) + ")")
                        .request(igdbConfig.REQUEST_URL + "/games");

                    const response2 = apicalypse(apicalypseOption)
                        .fields("id, name, platforms.abbreviation, category, cover.url")
                        .where("id = (" + ids.slice(7,) + ")")
                        .request(igdbConfig.REQUEST_URL + "/games");

                    await Promise.all([response1, response2])
                        .then((values) => {
                            igdbResponse.push(...values[0].data, ...values[1].data);
                        });
                }
                else {
                    const response1 = apicalypse(apicalypseOption)
                        .fields("id, name, platforms.abbreviation, category, cover.url")
                        .where("id = (" + ids.slice(0,) + ")")
                        .request(igdbConfig.REQUEST_URL + "/games");

                    await Promise.all([response1])
                        .then((values) => {
                            igdbResponse.push(...values[0].data);
                        });
                }

                break;
            }
            catch (err) {
                //// if igdb token expires or invalid ??? 
                if (i === 1) throw err;
                igdbToken.requestNewOathToken();
            }
        }

        for (let i = 0; i < result.rows.length; ++i) {
            for (let k = 0; k < igdbResponse.length; ++k) {
                if (result.rows[i].gameId === igdbResponse[k].id) {
                    result.rows[i] = {
                        gameDetail: igdbResponse[k],
                        review: result.rows[i]
                    }
                }
            }
        }

        res.send({
            user: { username: user.username, tag: user.tag },
            reviews: result.rows,
            reviewsCount: result.count,
            pageCount: Math.ceil(result.count / reviewsConfig.REVIEWS_SEARCHED_PER_PAGE),
            pageth: pageth
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

module.exports = app;