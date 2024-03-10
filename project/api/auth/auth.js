const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const { authConfig } = require("../config");


async function hashPassword(plainPassword) {
    return (
        await bcrypt.genSalt(authConfig.SALT_ROUNDS)
            .then(async (salt) => {
                return (

                    await bcrypt.hash(plainPassword, salt)
                        .then((hash) => {
                            return hash;
                        }).catch((err) => { throw err; })

                );
            }).catch((err) => { throw err; })
    );
}

async function comparePassword(plainPassword, hashPassword) {

    const result = await bcrypt.compare(plainPassword, hashPassword);
    // true / false
    return result;
}

function validateUsernameRegex(username) {

    if (username.length < authConfig.MIN_USERNAME_LENGTH || username.length > authConfig.MAX_USERNAME_LENGTH) {
        return 1;
    }

    if (!authConfig.USERNAME_REGEX.test(username)) {
        return 2;
    }

    return 0;
}

function validatePasswordRegex(password) {

    if (password.length < authConfig.MIN_PASSWORD_LENGTH || password.length > authConfig.MAX_PASSWORD_LENGTH) {
        return 1;
    }

    if (!authConfig.PASSWORD_REGEX.test(password)) {
        return 2;
    }

    return 0;
}

function validateEmailRegex(email) {

    // check regex email
    const isFake = authConfig.EMAIL_REGEX.test(email);
    if (isFake) return 1;

    return 0;
}

function validateTagRegex(tag) {

    if (tag.length !== authConfig.TAG_LENGTH) {
        return 1;
    }

    if (!authConfig.TAG_REGEX.test(tag)) {
        return 2;
    }

    return 0;
}

async function makeTag() {
    const f = await import("nanoid").then((_) => {
        return  _.customAlphabet(authConfig.TAG_ALPHABET, authConfig.TAG_LENGTH);
    });
    return f();
}


module.exports = {
    makeTag,
    hashPassword,
    comparePassword,
    validateEmailRegex,
    validateUsernameRegex,
    validatePasswordRegex,
    validateTagRegex
};