const express = require("express");
const AuthRecord = require("../auth/authRecord");
const { default: Sqids } = require("sqids");
const { recordConfig, igdbConfig, reviewsConfig } = require("../config");
const Token = require("../auth/token");
const igdbToken = require("../igdb/token");
const { default: apicalypse } = require("apicalypse");

const app = express();
const db = require("../db");
const UserModel = require("../models/UserModel");
const UserRecordGameModel = require("../models/UserRecordGameModel");
const UserRecordModel = require("../models/UserRecordModel");
const PlatformStoreModel = require("../models/PlatformStoreModel");
const { AuthError } = require("../auth/ErrorClass");

UserModel.hasMany(UserRecordGameModel, { foreignKey: "user_id" });
UserRecordGameModel.hasMany(UserRecordModel, { foreignKey: "userRecordGame_id" });
UserRecordModel.belongsTo(PlatformStoreModel, { foreignKey: "platformStore_id" });

app.post("/record/user/recent", Token.validateUser, async (req, res) => {
    try {
        const user_id = req.user_id;

        let averageScore = db.pgConnection.query(`
            SELECT avg("score")
            FROM "userRecordGames"
            WHERE user_id = ${user_id}
        `);

        const result = await UserRecordGameModel.findAndCountAll({
            where: {
                user_id
            },
            attributes: ["id", "gameId", "score", "favorite", "comment", "updatedAt"],
            include: {
                model: UserRecordModel,
                required: false,
            },
            distinct: true,
            order: [["updatedAt", "DESC"], [{ model: UserRecordModel }, "updatedAt", "DESC"]],
            limit: recordConfig.RECENT_MODIFIED_GAMERECORDS_SEARCHED,
        });

        if (result.rows.length === 0) {
            return res.send({ game: result, avg: "-" });
        }


        // retry 1 time when failed
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

                const response1 = apicalypse(apicalypseOption)
                    .fields("id, name, platforms.abbreviation, category, cover.url")
                    .where("id = (" + ids.slice(0, ids.length) + ")")
                    .request(igdbConfig.REQUEST_URL + "/games");

                await Promise.all([response1])
                    .then((values) => {
                        igdbResponse.push(...values[0].data);
                    });

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
                        userGameRecord: result.rows[i]
                    }
                }
            }
        }

        await Promise.all([averageScore])
            .then((values) => {
                averageScore = values[0][0][0].avg;
            });

        return res.send({ game: result, avg: parseFloat(averageScore).toFixed(2) });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

// try changing the verification part to the last later (improve when not recordOwner)
app.post("/record/user/:usernameWithTag/game", AuthRecord.validateRecordOwner, async (req, res) => {

    let sortingArr = req.body.sorting;
    if (!sortingArr) {
        sortingArr = [[,]]
    }
    else {
        if (sortingArr.game) {
            sortingArr = [[...sortingArr.game]];
        }
        else {
            sortingArr = [[{ model: UserRecordModel }, ...sortingArr.record]];
        }
    }
    let filterObj = {};
    let page = parseInt(req.body.page);
    const user_id = req.record.user_id;

    try {
        if (!user_id) {
            return res.status(204).send({ message: "No Record Found" });
        }

        // handle sorting
        if (req.body.sorting) {
            for (let i = 0; i < req.body.sorting.length; i++) {
                if (!req.body.sorting[i][0] || (req.body.sorting[i][1] !== "DESC" && req.body.sorting[i][1] !== "ASC")) {
                    continue;
                }

                sortingArr.push(req.body.sorting[i]);
            }
        }
        else {
            // default 
            sortingArr = [
                ["updatedAt", "DESC"]
            ];
        }

        ///////////////////////////


        // page
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        //////////////////////////

        // handle filter
        if (req.body.filter) {
            filterObj = req.body.filter;
        }
        else {
            // default
            filterObj = {};
        }

        //////////////////////////

        let result = [];

        result = await UserRecordGameModel.findAndCountAll({
            where: {
                user_id
            },
            attributes: ["id", "gameId", "score", "favorite", "comment", "updatedAt"],
            include: {
                model: UserRecordModel,
                required: false,
                where: filterObj,
            },
            distinct: true,
            order: sortingArr,
            limit: recordConfig.GAMERECORDS_SEARCHED_PER_PAGE,
            offset: ((page - 1) * recordConfig.GAMERECORDS_SEARCHED_PER_PAGE),
        });

        if (result.rows.length === 0) {
            return res.send({
                user: {
                    username: req.record.username,
                    tag: req.record.tag, 
                    isOwner: req.record.owner
                },
                games: result.rows,
                gamesCount: result.count,
                pageth: page,
                pageCount: 1
            });
        }

        // retry 1 time when failed
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
                        userGameRecord: result.rows[i]
                    }
                }
            }
        }


        return res.send({
            user: {
                username: req.record.username,
                tag: req.record.tag, 
                isOwner: req.record.owner
            },
            games: result.rows,
            gamesCount: result.count,
            pageth: page,
            pageCount: Math.ceil(result.count / reviewsConfig.REVIEWS_SEARCHED_PER_PAGE)
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.post("/record/game/add", Token.validateUser, async (req, res) => {
    try {
        const userGameAdd = {
            gameId: parseInt(req.body.gameId),
            score: req.body.score ? parseInt(req.body.score) : null,
            favorite: req.body.favorite ? true : false,
            comment: req.body.comment ? req.body.comment : null
        };

        const [found, isCreated] = await UserRecordGameModel.findOrCreate({
            where: {
                user_id: req.user_id,
                gameId: userGameAdd.gameId
            },
            defaults: {
                score: userGameAdd.score,
                favorite: userGameAdd.favorite,
                comment: userGameAdd.comment
            },
            attributes: ["gameId", "score", "favorite", "comment"]
        });


        if (isCreated) {
            return res.status(201).send({ result: found, isCreated });
        }
        else {
            return res.status(200).send({ result: found });
        }
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.put("/record/game/update", Token.validateUser, async (req, res) => {
    try {
        console.log(req.body);

        const userGameRecord_id = (await UserRecordGameModel.findOne({
            where: {
                id: req.body.userRecordGame_id,
                user_id: req.user_id
            },
            attributes: ["id"]

        })).id;

        if (!userGameRecord_id) {
            throw AuthError("incorrect user");
        }

        const userGameRecordUpdate = {
            id: parseInt(userGameRecord_id),
            score: req.body.score ? parseInt(req.body.score) : null,
            favorite: req.body.favorite ? true : false,
            comment: req.body.comment ? req.body.comment : null
        };

        const changes = await UserRecordGameModel.update(userGameRecordUpdate, {
            where: {
                id: userGameRecordUpdate.id
            }
        });

        const result = await UserRecordGameModel.findOne({
            where: {
                id: userGameRecordUpdate.id
            }
        });

        return res.send({ changes, result });
    }
    catch (err) {
        if (err instanceof AuthError) {
            res.status(401).send({ message: err.message, error: "user" });
        }
        else {
            res.status(500).send({ message: err.message, error: "unknown" });
        }
    }
});

app.post("/record/record/add", Token.validateUser, async (req, res) => {
    try {
        const userRecordGame_id = (await UserRecordGameModel.findOne({
            where: {
                gameId: req.body.gameId,
                user_id: req.user_id
            },
            attributes: ["id"]

        })).id;

        if (!userRecordGame_id) {
            throw AuthError("incorrect user");
        }

        const payload = {
            name: !req.body.name ? null : req.body.name,
            gameId: parseInt(req.body.gameId),
            status: parseInt(req.body.status),
            playtime: isNaN(parseInt(req.body.playtime)) ? null : parseInt(req.body.playtime),
            platformId: isNaN(parseInt(req.body.platformId)) ? null : parseInt(req.body.platformId),
            platformStore_name: !req.body.platformStore_name ? null : req.body.platformStore_name,
            startedAt: /(\d{4})-(\d{2})-(\d{2})/.test(req.body.startedAt) ? req.body.startedAt : null,
            finishedAt: /(\d{4})-(\d{2})-(\d{2})/.test(req.body.finishedAt) ? req.body.finishedAt : null,
            comment: !req.body.comment ? null : req.body.comment
        }

        const duplicatedExists = await UserRecordModel.findOne({
            where: {
                userRecordGame_id: userRecordGame_id,
            },
            order: [["duplicated", "DESC"]]
        });

        let found = { id: null }, created = false;
        if (payload.platformStore_name) {
            [found, created] = (await PlatformStoreModel.findOrCreate({
                where: {
                    name: payload.platformStore_name
                },
                attributes: ["id"],
            }));
        }
        ////////////////////////////////

        let duplicated = 1;
        if (duplicatedExists) {
            duplicated = duplicatedExists.duplicated + 1;
        }

        const newRecord = {
            userRecordGame_id: userRecordGame_id,
            duplicated: duplicated,
            name: payload.name,
            status: payload.status,
            playtime: payload.playtime,
            platformId: payload.platformId,
            platformStore_id: found.id,
            comment: payload.comment,
            startedAt: payload.startedAt,
            finishedAt: payload.finishedAt
        }

        /////// creating part
        const result = await UserRecordModel.create(newRecord);

        res.status(201).send({ platformCreated: created, newRecord, result });
    }
    catch (err) {
        if (err instanceof AuthError) {
            res.status(401).send({ message: err.message, error: "user" });
        }
        else {
            res.status(500).send({ message: err.message, error: "unknown" });
        }
    }
});

app.put("/record/record/update", Token.validateUser, async (req, res) => {
    try {
        /// last authenticate
        const gameId = (await UserRecordGameModel.findOne({
            where: {
                id: req.body.userRecordGame_id,
                user_id: req.user_id
            }
        })).gameId;

        if (!gameId) {
            throw AuthError("incorrect user");
        }

        ////////////////////////////////

        const payload = {
            userRecordGame_id: req.body.userRecordGame_id,
            duplicated: req.body.duplicated,
            name: req.body.name,
            status: parseInt(req.body.status),
            playtime: isNaN(parseInt(req.body.playtime)) ? null : parseInt(req.body.playtime),
            platformId: isNaN(parseInt(req.body.platformId)) ? null : parseInt(req.body.platformId),
            platformStore_name: !req.body.platformStore_name ? null : req.body.platformStore_name,
            startedAt: /(\d{4})-(\d{2})-(\d{2})/.test(req.body.startedAt) ? req.body.startedAt : null,
            finishedAt: /(\d{4})-(\d{2})-(\d{2})/.test(req.body.finishedAt) ? req.body.finishedAt : null,
            comment: !req.body.comment ? null : req.body.comment
        }

        ////////////////////////////////

        let platformFound = { id: null }, isCreated = false;
        if (payload.platformStore_name) {
            [platformFound, isCreated] = (await PlatformStoreModel.findOrCreate({
                where: {
                    name: payload.platformStore_name
                },
                attributes: ["id"],
            }));
        }

        const updatedRecord = {
            ...payload,
            gameId,
            platformStore_id: platformFound.id
        }

        const result = await UserRecordModel.update(updatedRecord, {
            where: {
                userRecordGame_id: payload.userRecordGame_id,
                duplicated: payload.duplicated
            }
        });

        const recordDate = await UserRecordModel.findOne({
            where: {
                userRecordGame_id: payload.userRecordGame_id,
                duplicated: payload.duplicated
            },
            attributes: ["createdAt", "updatedAt"]
        });

        updatedRecord.createdAt = recordDate.createdAt;
        updatedRecord.updatedAt = recordDate.updatedAt;
        delete updatedRecord.platformStore_name;


        res.status(200).send({ platformCreated: isCreated, updatedRecord, result });
    }
    catch (err) {
        if (err instanceof AuthError) {
            res.status(401).send({ message: err.message, error: "user" });
        }
        else {
            res.status(500).send({ message: err.message, error: "unknown" });
        }
    }
});

app.delete("/record/record/delete/:userRecordGame_id/:duplicated", Token.validateUser, async (req, res) => {
    try {
        const userRecordGame_id = parseInt(req.params.userRecordGame_id);
        const duplicated = parseInt(req.params.duplicated);

        if (isNaN(userRecordGame_id) || isNaN(duplicated)) {
            throw "incorrect parameters";
        }

        const isOwner = await UserRecordGameModel.findOne({
            where: {
                id: userRecordGame_id,
                user_id: req.user_id,
            }
        });

        if (!isOwner) {
            throw AuthError("incorrect user");
        }

        const isDeleted = await UserRecordModel.destroy({
            where: {
                userRecordGame_id,
                duplicated
            }
        });

        res.status(200).send({ isDeleted, result: { userRecordGame_id, duplicated } });
    }
    catch (err) {
        if (err instanceof AuthError) {
            res.status(401).send({ message: err.message, error: "user" });
        }
        else {
            res.status(500).send({ message: err.message, error: "unknown" });
        }
    }
})

// sequelize will delete all records of the game that request removal
app.delete("/record/game/delete/:userRecordGame_id", Token.validateUser, async (req, res) => {
    try {
        const userRecordGame_id = parseInt(req.params.userRecordGame_id);

        if (isNaN(userRecordGame_id)) {
            throw "incorrect parameters";
        }

        const isDeleted = await UserRecordGameModel.destroy({
            where: {
                id: userRecordGame_id,
                user_id: req.user_id
            }
        });

        if (!isDeleted) {
            throw AuthError("incorrect user");
        }

        res.status(200).send({ isDeleted, userRecordGame_id });
    }
    catch (err) {
        if (err instanceof AuthError) {
            res.status(401).send({ message: err.message, error: "user" });
        }
        else {
            res.status(500).send({ message: err.message, error: "unknown" });
        }
    }
})

module.exports = app;