const JWT = require("jsonwebtoken");
const { authConfig, tokenConfig } = require("../config");
const dayjs = require("dayjs");
const { Op } = require("sequelize");

const UserModel = require("../models/UserModel");
const RefreshTokenModel = require("../models/RefreshTokenModel");
const { AuthError, TokenError } = require("./ErrorClass");

function deleteRefreshToken(user_id, exceptionToken) {
    const except = exceptionToken ? exceptionToken.toString().split("-")[0] : "";

    RefreshTokenModel.findAll({
        where: {
            user_id: user_id
        },
        attributes: ["token", "extraId"]
    })
    .then((allToken) => {

        for(let i = 0; i < allToken.length; ++i) {
            if(allToken[i].token !== except) {
                RefreshTokenModel.destroy({
                    where: {
                        user_id: user_id,
                        extraId: allToken[i].extraId,
                        token: allToken[i].token
                    }                
                })

            }
        }

    });
}

function splitRefreshToken(fullRefreshToken) {
    let [refreshToken, extraId] = fullRefreshToken.split("-");
    return [refreshToken, extraId];
}

function verifyAccessToken(req, res) {
    try {
        
        
        let access = "";
        if (req.headers.authorization) {
            access = req.headers.authorization.split(" ")[1];
        }
        // token valid
        if (JWT.verify(access, tokenConfig.ACCESS_SECRET)) {
            
            return true;
        }
    }
    catch (err) {
        if (err instanceof JWT.TokenExpiredError || err instanceof JWT.JsonWebTokenError) {
            
            return verifyRefreshToken(res, req.cookies.token);
        }
        else {
            throw err;
        }
    }
}

// will force res.send "refresh" if the refresh token is valid
function verifyRefreshToken(res, fullToken) {
    try {
        

        if (!fullToken || fullToken === "") {
            throw new TokenError("no token");
        }
        const [token, extraId] = splitRefreshToken(fullToken);
        let extraTemp = Number(extraId);
        if (extraId === undefined || !Number.isInteger(extraTemp)) {
            throw new TokenError("incorrected token");
        }

        // delete ALL Refresh Tokens that already expired in db
        deleteDisabledRefreshToken()
            .then(async () => {

                // find the specific Refresh Token and return user detail
                const found = await findRefreshToken(token, extraId);
                if (!found) {
                    throw new AuthError("no matched token");
                }

                // generate NEW Access Token
                const newToken = await createAccessToken(found.user.dataValues);

                // return to client
                return res.status(202).send({
                    message: "refresh",
                    access: newToken,
                    user: {
                        username: found.user.dataValues.username,
                        tag: found.user.dataValues.tag
                    }
                });
            })
            .catch((err) => {
                if(err instanceof AuthError) {
                    res.clearCookie("token");
                    return res.status(401).send({ message: err.message, error: "auth" });
                }
                else {
                    return res.status(500).send({ message: err.message, error: "unknown"});
                }
            })
    }
    catch (err) {
        return res.status(500).send({ message: err.message, error: "unknown"});
    }
}

async function deleteDisabledRefreshToken() {
    await RefreshTokenModel.destroy({
        where: {
            expiresAt: {
                [Op.lte]: new Date()
            }
        }
    });
}

async function findRefreshToken(token, extraId) {
    RefreshTokenModel.belongsTo(UserModel, { foreignKey: "user_id" });

    const found = await RefreshTokenModel.findOne({
        where: {
            extraId: extraId,
            token: token,
        },
        attributes: ["user_id", "extraId", "token"],
        include: {
            model: UserModel,
            attributes: ["id", "username", "tag"]
        }
    })

    return found;
}

//////////////////////// MAIN ////////////////////////////////

function getCurrentUserAppearance(req) {
    const user = JWT.decode(req.headers.authorization.split(" ")[1], { json: true });
    return {
        username: user.username,
        tag: user.tag
    };
}

async function deleteCurrentRefreshToken(req) {

    const [token, extraId] = splitRefreshToken(req.cookies.token);

    let result = null;
    if (token.length === tokenConfig.REFRESH_CHAR_LENGTH) {

        result = await RefreshTokenModel.destroy({
            where: {
                extraId: extraId,
                token: token
            }
        });
    }

    return result;
}

async function createAccessToken(payload) {
    const token = JWT.sign({ ...payload }, tokenConfig.ACCESS_SECRET, {
        expiresIn: tokenConfig.ACCESS_EXPIRES_IN_MINUTES * (60),
        algorithm: tokenConfig.ACCESS_ALGO
    })
    return token;
}

// vvv put in login then send within cookie { httpOnly, secure }
async function createRefreshToken(user_id, refreshLast) {
    let newToken = "";
    let newExtraId = "";

    await import("nanoid")
        .then(async (_) => {
            const makeToken = _.customAlphabet(
                tokenConfig.REFRESH_CHAR_ALPHABET, tokenConfig.REFRESH_CHAR_LENGTH
            );

            // find all user's Refresh Tokens
            const tokensFound = await RefreshTokenModel.findAll({
                where: {
                    user_id: user_id
                },
                order: [["expiresAt", "DESC"]]
            });

            // check if user has Refresh Token more than OR equal to quota
            // (delete if equal to replace the one with nearest expires date)
            if (tokensFound.length >= tokenConfig.REFRESH_TOKENS_QUOTA) {
                const excessiveTokens = [];

                for (let i = tokenConfig.REFRESH_TOKENS_QUOTA - 1; i < tokensFound.length; ++i) {
                    excessiveTokens.push(tokensFound[i].extraId);
                }

                // delete all excessive Refresh Tokens with user_id and extraId
                excessiveTokens.map(async (row) => {
                    await RefreshTokenModel.destroy({
                        where: {
                            user_id: user_id,
                            extraId: row
                        }
                    });
                })

                // cut all the excessive out
                tokensFound = tokensFound.slice(0, tokenConfig.REFRESH_TOKENS_QUOTA - 2);
            }

            const makeExtra = _.customAlphabet(
                tokenConfig.REFRESH_EXTRA_CHAR_ALPHABET, tokenConfig.REFRESH_EXTRA_CHAR_LENGTH
            );

            // generate NEW Refresh Token and regenerate if it's not available (already used)
            while (true) {
                newToken = makeToken();
                const isExist = tokensFound.some((row) => row.token === newToken);
                if (!isExist) break;
            }
            // generate NEW Extra use with user_id and regenerate if it's not available (already used)
            while (true) {
                newExtraId = makeExtra()

                const isExist = tokensFound.some((row) => row.extraId === newExtraId);
                if (!isExist) break;
            }

            // generate expires date
            const expiresDate = dayjs(new Date(Date.now() + refreshLast)).format("YYYY-MM-DD HH:mm:ss.sssZ");

            await RefreshTokenModel.create({
                user_id: user_id,
                extraId: newExtraId,
                token: newToken,
                expiresAt: expiresDate
            })
        })
        .catch((err) => {
            throw err;
        })

    return { token: newToken, extra: newExtraId };
}


// vvv Middleware
function validateUser(req, res, next) {
    try {
        req.user_id = "";

        if (verifyAccessToken(req, res)) {
            const tokenUser = JWT.decode(req.headers.authorization.split(" ")[1], { json: true });

            UserModel.findOne({
                where: {
                    username: tokenUser.username,
                    tag: tokenUser.tag
                },
                attributes: ["id"]
            })
                .then((data) => {
                    req.user_id = data.id;
                    if (!req.user_id) {
                        throw AuthError;
                    }
                    else {
                        return next();
                    }
                })
                .catch((err) => {
                    throw err;
                })
        }
    }
    catch (err) {
        if (err instanceof AuthError) {
            return res.status(401).send({ message: err.message, error: "auth" });
        }
        else if (err instanceof TokenError) {
            res.clearCookie("token");
            return res.status(401).send({ message: err.message, error: "token" });
        }
        else {
            return res.status(500).send({ message: err.message, error: "unknown" });
        }
    }
}

function validateUserNoError(req, res, next) {
    try {
        req.username = "";
        req.tag = "";

        if (verifyAccessToken(req, res)) {
            const tokenUser = JWT.decode(req.headers.authorization.split(" ")[1], { json: true });

            req.username = tokenUser.username;
            req.tag = tokenUser.tag
        }

        return next();
    }
    catch (err) {
        next();
    }
}

////////////////////////////////////////

module.exports = {
    validateUser,
    validateUserNoError,
    createAccessToken,
    verifyAccessToken,
    createRefreshToken,
    getCurrentUserAppearance,
    deleteCurrentRefreshToken,
    deleteRefreshToken,
}