require("dotenv").config();

const authConfig = {
    MIN_USERNAME_LENGTH: 2,
    MAX_USERNAME_LENGTH: 24,
    MAX_PASSWORD_LENGTH: 64,
    MIN_PASSWORD_LENGTH: 6,
    SALT_ROUNDS: 10,
    FAIL_LOGIN_DELAY: 1000,
    EMAIL_REGEX: /^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@↵(?:[A-Z0-9-]+\.)+[A-Z]{2,6}$/,
    USERNAME_REGEX: /^[a-zA-Z0-9_]*$/,
    PASSWORD_REGEX: /^[ -~]*$/,
    TAG_ALPHABET: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    TAG_REGEX: /^[0-9A-Z]*$/,
    TAG_LENGTH: 8,
    TAG_CREATION_RETRY_TIMES: 5,

    USERNAMEWITHTAG_REGEX: /^([a-zA-Z0-9_]*)-([0-9A-Z]*)$/
}

const tokenConfig = {
    ACCESS_ALGO: "HS512",
    ACCESS_SECRET: process.env.SECRET,
    ACCESS_EXPIRES_IN_MINUTES: 0.5,
    REFRESH_CHAR_ALPHABET: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    REFRESH_CHAR_LENGTH: 24,
    REFRESH_EXPIRES_IN_DAY: 1,
    REMEMBERME_DAY: 119,
    REFRESH_TOKENS_QUOTA: 5,
    REFRESH_EXTRA_CHAR_ALPHABET: "0123456789",
    REFRESH_EXTRA_CHAR_LENGTH: 3
}

const igdbConfig = {
    CLIENT_ID_KEYNAME: "client_id",
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET_KEYNAME: "client_secret",
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    GRANT_TYPE_KEYNAME: "grant_type",
    GRANT_TYPE: "client_credentials",

    OAUTH_URL: "https://id.twitch.tv/oauth2/token",
    OAUTH_VALIDATE_URL: "https://id.twitch.tv/oauth2/validate",
    REQUEST_URL: "https://api.igdb.com/v4",

    GAMES_SEARCHED_PER_PAGE: 30
}

const recordConfig = {
    GAMERECORDS_SEARCHED_PER_PAGE: 20,
    RECENT_MODIFIED_GAMERECORDS_SEARCHED: 5
}

const reviewsConfig = {
    REVIEWS_SEARCHED_PER_PAGE: 20,
}




module.exports = {
    authConfig,
    tokenConfig,
    igdbConfig,
    recordConfig,
    reviewsConfig
}