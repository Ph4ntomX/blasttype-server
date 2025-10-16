const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const PORT = 5123;

const UserAuthRoute = require("./route/auth");
const UserRoute = require("./route/user");
const PassagesRoute = require("./route/passages");
const GamesRoute = require("./route/games");
const ChallengesRoute = require("./route/challenge");
const initSocket = require("./socket");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI + "/blasttype");
        console.log("MongoDB is Connected");
    } catch (error) {
        console.log(error);
    }
}

connectToMongoDB();


app.get("/api", (req, res) => {
    res.send("Welcome to BlastType API");
})

app.use(cors());
app.use(express.json());

app.use("/api/auth", UserAuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/passages", PassagesRoute);
app.use("/api/games", GamesRoute);
app.use("/api/challenges", ChallengesRoute);



initSocket(server);

server.listen(PORT, () => {
    console.log("server is running at http://localhost:" + PORT);
});