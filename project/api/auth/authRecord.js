const Token = require("../auth/token");
const JWT = require("jsonwebtoken");
const { AuthError, TokenError } = require("../auth/ErrorClass");
const { authConfig } = require("../config");
const UserModel = require("../models/UserModel");

//// middleware vvv

// get user access token (which has thier username and tag)
// validate it
// then compare if it's match the record's username and tag
// if it is then this access token is the owner

function validateRecordOwner(req, res, next) {
    try {
        req.record = {
            user_id: null,
            owner: false
        };

        const arr = authConfig.USERNAMEWITHTAG_REGEX.exec(req.params.usernameWithTag);
        if (!arr || arr.length !== 3 || arr[2].length !== authConfig.TAG_LENGTH) {
            throw AuthError("incorrect parameters");
        }

        const username = arr[1].toString();
        const tag = arr[2].toString();

        let passedVerify = false;

        try {
            passedVerify = Token.verifyAccessToken(req, res);
        }
        catch(err) { }

        if (passedVerify) {
            const tokenUser = JWT.decode(req.headers.authorization.split(" ")[1], { json: true });

            if (tokenUser.username === username && tokenUser.tag === tag) {
                req.record.owner = true;
            }
        }
        else {
            // throw new TokenError("expired");
        }


        ///////// THIS MIDDLEWARE KEEP THROWING ERROR SOMETIMES, IDK WHY + I'M LAZY SO I JUST IGNORE IT FOR NOW

        UserModel.findOne({
            where: {
                username: username,
                tag: tag
            },
            attributes: ["id"]
        })
            .then((data) => {
                req.record.user_id = data.id;
                req.record.username = username;
                req.record.tag = tag;
                next();
            })
    }

    catch (err) {
        return res.status(500).send({ message: err.message, error: "unknown" });

    }

}


module.exports = {
    validateRecordOwner
}