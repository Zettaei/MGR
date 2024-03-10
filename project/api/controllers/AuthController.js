const express = require("express");
const Auth = require("../auth/auth");
const Token = require("../auth/token")
const { authConfig, tokenConfig } = require("../config");
const db = require("../db");

const app = express();
const UserModel = require("../models/UserModel");
const UserProfileModel = require("../models/UserProfile");
const { AuthError, TokenError } = require("../auth/ErrorClass");

app.get("/check", Token.validateUser, async (req, res) => {
    res.send({ me: "YEAS" });
});

app.get("/currentUser", Token.validateUser, async (req, res) => {
    try {
        const user = Token.getCurrentUserAppearance(req);
        res.send({
            access: req.headers.authorization.split(" ")[1],
            user: user
        })
    }
    catch (err) {
        if (err instanceof AuthError || err instanceof TokenError) {
            return res.status(401).send({ message: err.message, error: "auth" });
        }
        else {
            return res.status(500).send({ message: err.message, error: "unknown" });
        }
    }
});

app.post("/changePassword", Token.validateUser, async (req, res) => {
    try {
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;

        if (!currentPassword || currentPassword.length < authConfig.MIN_PASSWORD_LENGTH || currentPassword.length > authConfig.MAX_PASSWORD_LENGTH || !authConfig.PASSWORD_REGEX.test(currentPassword)) {
            return res.status(400).send({ message: "form error", error: "form" });
        }

        if (!newPassword || newPassword.length < authConfig.MIN_PASSWORD_LENGTH || newPassword.length > authConfig.MAX_PASSWORD_LENGTH || !authConfig.PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).send({ message: "form error", error: "form" });
        }

        const userFound = await db.pgConnection.query(`
        SELECT id, username, tag, convert_from(password, 'UTF8') as hash
        FROM users
        WHERE id = ${req.user_id}
        ;`);

        const hash = userFound[0][0].hash;
        const success = await Auth.comparePassword(currentPassword, hash);
        if (!success) {
            return res.status(401).send({ message: "password incorrected", error: "auth" });
        }

        const newHashPassword = await Auth.hashPassword(newPassword);
        await UserModel.update({ password: newHashPassword }, {
            where: {
                id: req.user_id
            }
        })

        // delete all refresh Token
        Token.deleteRefreshToken(req.user_id);

        res.status(200).end();
    }
    catch (err) {
        return res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.post("/revokeOtherAccess", Token.validateUser, async (req, res) => {
    try {
        const password = req.body.currentPassword;

        if (!password || password.length < authConfig.MIN_PASSWORD_LENGTH || password.length > authConfig.MAX_PASSWORD_LENGTH || !authConfig.PASSWORD_REGEX.test(password)) {
            return res.status(400).send({ message: "form error", error: "form" });
        }

        const userFound = await db.pgConnection.query(`
        SELECT id, username, tag, convert_from(password, 'UTF8') as hash
        FROM users
        WHERE id = ${req.user_id}
        ;`);

        const hash = userFound[0][0].hash;
        const success = await Auth.comparePassword(password, hash);
        if (!success) {
            return res.status(401).send({ message: "password incorrected", error: "auth" });
        }

        Token.deleteRefreshToken(req.user_id, req.cookies.token);
        res.end();
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.get("/aboutMe", Token.validateUser, async (req, res) => {
    try {
        const user_id = req.user_id;

        const aboutMe = await UserProfileModel.findOne({
            where: {
                user_id: user_id,
            }
        });

        return res.send({ aboutMe: aboutMe.aboutMe });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.put("/aboutMe/change", Token.validateUser, async (req, res) => {
    try {
        const user_id = req.user_id;

        await UserProfileModel.update({
            aboutMe: req.body.newAboutMe
        },
            {
                where: {
                    user_id: user_id
                }
            });

        return res.send({});
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const payload = {
            email: req.body.email,
            password: req.body.password,
            rememberMe: req.body.rememberMe
        }

        if (payload.email === "" || payload.password === "") {
            return res.status(401).send({ message: "form error", error: "form" });
        }

        const emailIsWrong = await Auth.validateEmailRegex(payload.email);
        if (emailIsWrong > 1) {
            return res.status(401).send({ message: "form error", error: "form" });
        }

        // check if email already exists
        const userFound = await db.pgConnection.query(`
        SELECT id, username, tag, convert_from(password, 'UTF8') as hash
        FROM users
        WHERE email = '${payload.email}'
        ;`);
        if (!userFound[0][0]) {
            return res.status(401).send({ message: "email or password incorrected or don't exist", error: "none" });
        }

        const hash = userFound[0][0].hash;
        const success = await Auth.comparePassword(payload.password, hash);
        if (!success) {
            return res.status(401).send({ message: "email or password incorrected or don't exist", error: "none" });
        }

        let refreshLast = tokenConfig.REFRESH_EXPIRES_IN_DAY;
        if (payload.rememberMe) refreshLast += tokenConfig.REMEMBERME_DAY;
        refreshLast = refreshLast * (24 * 60 * 60 * 1000);    // to millisec


        const refreshToken = await Token.createRefreshToken(userFound[0][0].id, refreshLast);
        const accessToken = await Token.createAccessToken({
            id: userFound[0][0].id,
            username: userFound[0][0].username,
            tag: userFound[0][0].tag
        });

        const user = {
            username: userFound[0][0].username,
            tag: userFound[0][0].tag
        }

        res.cookie("token", refreshToken.token.toString() + "-" + refreshToken.extra.toString(), {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            expires: new Date(Date.now() + refreshLast)
        })

        console.log("re", refreshToken);
        console.log("ac", accessToken);


        res.send({
            message: "success",
            access: accessToken,
            user: user
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message })
    }
});

app.post("/register", async (req, res) => {

    try {
        const payload = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        }

        if (payload.email === "" || payload.username === "" || payload.password === "") {
            return res.status(401).send({ message: "form error", error: "form" });
        }

        const usernameIsWrong = await Auth.validateUsernameRegex(payload.username);
        if (usernameIsWrong > 0) {
            return res.status(401).send({ message: "form error", error: "form" });
        }

        const passwordIsWrong = await Auth.validatePasswordRegex(payload.password);
        if (passwordIsWrong > 0) {
            return res.status(401).send({ message: "form error", error: "form" });
        }

        const emailIsWrong = await Auth.validateEmailRegex(payload.email);
        if (emailIsWrong > 1) {
            return res.status(401).send({ message: "form error", error: "form" });
        }

        // check if email already exists
        const emailIsUsed = await UserModel.findOne({
            where: {
                email: payload.email
            }
        });
        if (emailIsUsed) {
            return res.status(401).send({ message: "email is already used", error: "email" });
        }

        const newHashPassword = await Auth.hashPassword(payload.password);

        // make new unique Tag with numbers of tries, if all failed tell client to get new username LOL
        let selectedTag = "";

        for (let tries = 0; tries < authConfig.TAG_CREATION_RETRY_TIMES; ++tries) {

            const newTag = await Auth.makeTag();

            const tagUsed = await UserModel.findOne({
                where: {
                    username: payload.username,
                    tag: newTag
                }
            });

            if (!tagUsed) {
                selectedTag = newTag;
                break; /////////// break here!
            }
        }
        if (selectedTag === "") {
            return res.status(401).send({ message: "too many of the username", error: "username" });
        }

        //////////////////////////////////////////////////////////
        // bytea is default encoding to UTF-8??? idk
        await UserModel.create({
            email: payload.email,
            username: payload.username,
            tag: selectedTag,
            password: newHashPassword
        });

        res.status(201).send({ message: "success" });
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" })
    }
});

app.get("/logout", async (req, res) => {
    try {
        if (req.cookies.token) {
            await Token.deleteCurrentRefreshToken(req);
        }
        res.clearCookie("token");
        res.end();
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = app;
