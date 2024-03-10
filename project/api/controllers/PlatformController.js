const express = require("express");

const app = express();
const PlatformStoreModel = require("../models/PlatformStoreModel");

app.get("/platformStore/list", async (req, res) => {
    try {
        const list = await PlatformStoreModel.findAll({
            order: [["id", "ASC"]],
            attributes: ["id", "name"]
        });

        res.send(list);
    }
    catch (err) {
        res.status(500).send({ message: err.message, error: "unknown" });
    }

});


module.exports = app;