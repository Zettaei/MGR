const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ override: true });

process.on("uncaughtException" , (err, origin) => {
    console.error("-------------------- error -------------------- < " + origin + " >");
    console.error(err);
    console.error("-----------------------------------------------");
})

const PORT = process.env.PORT_MAIN;

const app = express();
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser());

app.use(require("./controllers/AuthController"));
app.use(require("./controllers/GameController"));
app.use(require("./controllers/UserRecordController"));
app.use(require("./controllers/PlatformController"));
app.use(require("./controllers/UserController"));


app.listen(PORT, () => {
    console.log("Server running on Port " + PORT);
});
