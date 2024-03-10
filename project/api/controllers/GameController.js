const express = require("express");
const Token = require("../auth/token");
const igdbToken = require("../igdb/token");
const { igdbConfig, reviewsConfig } = require("../config");
const { default: apicalypse } = require("apicalypse");

const app = express();
const UserModel = require("../models/UserModel");
const UserRecordGameModel = require("../models/UserRecordGameModel");
const UserRecordModel = require("../models/UserRecordModel");
const GameReviewsModel = require("../models/GameReviewsModel");
const { Sequelize } = require("sequelize");
GameReviewsModel.belongsTo(UserModel, { foreignKey: "user_id" });
UserModel.hasMany(UserRecordGameModel, { foreignKey: "user_id" });
UserRecordGameModel.hasMany(UserRecordModel, { foreignKey: "userRecordGame_id" });

app.get("/game/search//:page", async (req, res) => {
    try {
        const page = req.params.page;

        // retry only 2 times if failed
        let response;
        for (let i = 0; i < 2; ++i) {
            try {
                const igdbAccessToken = await igdbToken.getIGDBtoken();
                const apicalypseOption = {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + igdbAccessToken,
                        "Client-ID": igdbConfig.CLIENT_ID
                    }
                }

                response = await apicalypse(apicalypseOption)
                    .fields("id, name, platforms.abbreviation, category, cover.url, first_release_date")
                    .where(`category != (1, 3, 7, 13, 14) & version_parent = null`)
                    // vvv hacky way to foresee if the next page is available by +1
                    .limit((igdbConfig.GAMES_SEARCHED_PER_PAGE + 1))
                    .offset((page - 1) * igdbConfig.GAMES_SEARCHED_PER_PAGE)
                    .sort("follows desc;")
                    .request(igdbConfig.REQUEST_URL + "/games");

                break;
            }
            catch (err) {
                //// if igdb token expires or invalid ??? 
                if (i === 1) throw err;
                igdbToken.requestNewOathToken();
            }
        }

        return res.send(response.data);
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" })
    }
})

app.get("/game/search/:title/:page", async (req, res) => {
    try {
        const page = req.params.page;
        const title = req.params.title;

        // retry only 2 times if failed
        let response;
        for (let i = 0; i < 2; ++i) {
            try {
                const igdbAccessToken = await igdbToken.getIGDBtoken();
                const apicalypseOption = {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + igdbAccessToken,
                        "Client-ID": igdbConfig.CLIENT_ID
                    }
                }

                response = await apicalypse(apicalypseOption)
                    .fields("id, name, platforms.abbreviation, category, cover.url, first_release_date")
                    .where(`category != (1, 3, 7, 13, 14) & version_parent = null`)
                    .search(title)
                    // vvv hacky way to foresee if the next page is available by +1
                    .limit((igdbConfig.GAMES_SEARCHED_PER_PAGE + 1))
                    .offset((page - 1) * igdbConfig.GAMES_SEARCHED_PER_PAGE)
                    .request(igdbConfig.REQUEST_URL + "/games");

                break;
            }
            catch (err) {
                //// if igdb token expires or invalid ??? 
                if (i === 1) throw err;
                igdbToken.requestNewOathToken();
            }
        }


        return res.send(response.data);
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" })
    }
});


// should've send back platform name and platform store name too;
app.get("/game/id/:id", Token.validateUserNoError, async (req, res) => {
    try {
        let id = req.params.id;
        let ownReview = null;

        if (isNaN(Number(id))) {
            return res.status(400).send({ message: "incorrect game id", error: "id" });
        }

        let gameDetail = {};
        for (let i = 0; i < 2; ++i) {
            try {
                const igdbAccessToken = await igdbToken.getIGDBtoken();
                const apicalypseOption = {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + igdbAccessToken,
                        "Client-ID": igdbConfig.CLIENT_ID
                    }
                }

                gameDetail = await apicalypse(apicalypseOption)
                    .fields(`
                id, name, cover.url, 
                platforms.abbreviation, 
                category,
                genres.name,
                first_release_date, 
                release_dates.human,
                release_dates.m,
                release_dates.y,
                release_dates.platform.abbreviation,
                release_dates.region,
                summary,
                storyline,
                alternative_names.name,
                franchise.*, 
                franchises.*, 
                game_localizations.name,
                game_localizations.region.*, 
                screenshots.*, 
                platforms.name, 
                tags, 
                themes.name, 
                websites.url, 
                external_games.*, 
                language_supports.language.name,  
                language_supports.language_support_type.name, 
                involved_companies.company.id,
                involved_companies.developer,
                involved_companies.publisher,
                involved_companies.supporting,
                involved_companies.porting,
                involved_companies.company.name
            `)
                    .where(`id = ${id}`)
                    .request(igdbConfig.REQUEST_URL + "/games");

                break;
            }
            catch (err) {
                //// if igdb token expires or invalid ???       
                if (i === 1) throw err;
                igdbToken.requestNewOathToken();
            }
        }


        if (!gameDetail) {
            return res.send({});
        }

        let userGameRecord = {};
        let userRecord = [];
        if (req.username && req.tag) {

            const user_id = (await UserModel.findOne({
                where: {
                    username: req.username,
                    tag: req.tag
                },
                attributes: ["id"]
            })).id;

            ownReview = GameReviewsModel.findOne({
                where: {
                    user_id: user_id,
                    gameId: id
                },
                attributes: ["id", "gameId", "recommended", "review", "createdAt", "updatedAt"]
            });

            userGameRecord = (await UserRecordGameModel.findOne({
                where: {
                    user_id: user_id,
                    gameId: id
                },
                attributes: ["id", "gameId", "score", "favorite", "comment", "createdAt", "updatedAt"]
            }));

            if (userGameRecord) {
                userRecord = (await UserRecordModel.findAll({
                    where: {
                        userRecordGame_id: userGameRecord.id
                    },
                    order: [["updatedAt", "DESC"]]
                }));
            }

            await Promise.all([ownReview])
                .then((values) => {
                    if (values[0]) {
                        ownReview = (values[0]);
                    }
                })
        }


        res.send({
            gameDetail: gameDetail.data[0], userGameRecord, userRecord,
            ownReview: ownReview ? 
            {
                id: parseInt(ownReview.id),
                gameId: ownReview.gameId,
                recommended: ownReview.recommended,
                review: ownReview.review,
                createdAt: ownReview.createdAt,
                updatedAt: ownReview.updatedAt
            }
            :
            {}
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" })
    }
});

app.post("/game/id/:id/reviews/add", Token.validateUser, async (req, res) => {
    try {
        const gameId = req.params.id;
        const review = req.body.review;
        const recommended = req.body.recommended;

        if (!gameId || !review || !(recommended >= -1 && recommended <= 1)) {
            return res.status(400).send({ message: "payload is incorrect", error: "payload" });
        }
        const updatedDate = new Date();
        let [find, isCreated] = await GameReviewsModel.findOrCreate({
            where: {
                user_id: req.user_id,
                gameId: gameId
            },
            defaults: {
                review: review,
                recommended: recommended
            }
        });

        if (!isCreated) {
            await GameReviewsModel.update({
                review: review,
                recommended: recommended
            }, {
                where: {
                    user_id: req.user_id,
                    gameId: gameId
                }
            });
        }

        return res.send({ id: find.id ,recommended: recommended, review: review, updatedAt: updatedDate });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.get("/game/id/:id/reviews/:page", async (req, res) => {
    try {
        const gameId = req.params.id;
        let pageth = req.params.page;
        let result;

        if (isNaN(pageth)) {
            res.status(400).send({ message: "incorrect params", error: "params" });
        }

        if (!pageth || pageth <= 0) {
            pageth = 1;
        }

        if (gameId) {

            result = await GameReviewsModel.findAndCountAll({
                where: {
                    gameId: gameId
                },
                attributes: [
                    "id",
                    "recommended",
                    [Sequelize.literal('SUBSTRING("review" from 1 for 90 * 5)'), "review"],
                    "updatedAt"
                ],
                include: {
                    model: UserModel,
                    attributes: ["username", "tag"],
                },
                limit: 20,
                offset: (pageth - 1)
            });

            res.send({ reviewsList: result.rows, pageth: pageth, pageCount: Math.ceil(result.count / reviewsConfig.REVIEWS_SEARCHED_PER_PAGE) });
        }
        else {
            res.status(400).send({ message: "incorrect params", error: "params" });
        }

    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" })
    }
});

app.get("/review/:id", async (req, res) => {
    try {
        const reviewId = Math.floor(req.params.id);

        if (isNaN(reviewId) || (parseFloat(req.params.id) - reviewId) !== 0 || reviewId < 0) {
            return res.send({});
        }

        const result = await GameReviewsModel.findOne({
            where: {
                id: reviewId
            },
            include: {
                model: UserModel,
                attributes: ["username", "tag"]
            }
        });

        let gameDetail;
        for (let i = 0; i < 2; ++i) {
            try {
                const igdbAccessToken = await igdbToken.getIGDBtoken();
                const apicalypseOption = {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + igdbAccessToken,
                        "Client-ID": igdbConfig.CLIENT_ID
                    }
                }

                gameDetail = await apicalypse(apicalypseOption)
                    .fields(`
                id, name, cover.url, 
                platforms.abbreviation
            `)
                    .where(`id = ${result.gameId}`)
                    .request(igdbConfig.REQUEST_URL + "/games");

                break;
            }
            catch (err) {
                if (i === 1) throw err;
                igdbToken.requestNewOathToken();
            }
        }

        res.send({ review: result, gameDetail: gameDetail.data[0] });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.delete("/review/:id/delete", Token.validateUser, async (req, res) => {
    try {
        const reviewId = Math.floor(req.params.id);

        if (isNaN(reviewId) || (parseFloat(req.params.id) - reviewId) !== 0 || reviewId < 0) {
            return res.status(400).send({ message: "params is incorrect", error: "params" });
        }

        const result = await GameReviewsModel.destroy({
            where: {
                id: reviewId
            }
        });

        res.send({ result });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});


module.exports = app;