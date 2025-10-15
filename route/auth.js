const express = require("express");
const router = express.Router();

const Controller = require("../controllers/user");

router.post("/signup", async (req, res) => {
    try {
        const users = await Controller.signUpUser(req.body.username, req.body.email, req.body.password);
        res.status(200).send(users);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message || "Error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const users = await Controller.signInUser(req.body.username, req.body.password);
        res.status(200).send(users);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message || "Error" });
    }
});

module.exports = router;
