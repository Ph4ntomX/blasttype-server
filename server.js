const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const UserAuthRoute = require("./route/auth");
const UserRoute = require("./route/user");
const PassagesRoute = require("./route/passages");
const initSocket = require("./socket");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

async function connectToMongoDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/blasttype");
        console.log("MongoDB is Connected");
    } catch (error) {
        console.log(error);
    }
}

connectToMongoDB();


app.get("/", (req, res) => {
    res.send("Welcome to BlastType API");
})

app.use(cors());
app.use(express.json());

app.use("/auth", UserAuthRoute);
app.use("/users", UserRoute);
app.use("/passages", PassagesRoute);

initSocket(server);

server.listen(5123, () => {
    console.log("server is running at http://localhost:5123");
});