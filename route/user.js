const express = require("express");
const router = express.Router();

const Controller = require("../controllers/user");

router.get("/", async (req, res) => {
    try {
        const users = await Controller.getUsers();
        res.status(200).send(users);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Error" });
    }
});

module.exports = router;
