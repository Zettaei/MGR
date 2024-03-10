const { igdbConfig } = require("../config");
const { default: Axios } = require("axios");
const fs = require("node:fs/promises");
const path = require("node:path");

// let token = null;
let token; ///////////////// DEFAULT FOR TESTING
const twitchOathTokenPath = path.join("./igdb", "twitchOathToken");

async function requestNewOathToken() {
    await Axios.post(
        igdbConfig.OAUTH_URL + '?' +
        igdbConfig.CLIENT_ID_KEYNAME + '=' + igdbConfig.CLIENT_ID + '&' +
        igdbConfig.CLIENT_SECRET_KEYNAME + '=' + igdbConfig.CLIENT_SECRET + '&' +
        igdbConfig.GRANT_TYPE_KEYNAME + '=' + igdbConfig.GRANT_TYPE
    )
        .then(async (res) => {
            token = res.data.access_token;

            await fs.writeFile(twitchOathTokenPath, token, { flag: "w+", encoding: "utf-8" });
        })
        .catch((err) => {
            token = null;
            throw err;
        });

    return token;
}

async function getIGDBtoken() {
    try {
        token = await fs.readFile(twitchOathTokenPath, { encoding: "utf-8" })
            .then((data) => {
                return data;
            });

        console.log("#igdb access: " + token);

        if (!token || token.length < 5) {
            token = await requestNewOathToken();
        }

        return token;
    }
    catch (err) {
        console.log("TWITCH_OATH | " + err.message);
        return null;
    }
}

module.exports = {
    getIGDBtoken,
    requestNewOathToken
}