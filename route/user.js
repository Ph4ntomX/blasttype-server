const express = require("express");
const router = express.Router();

const Controller = require("../controllers/user");

const { authenticateUser, authenticateAdmin } = require("../middleware/auth");

router.get("/", authenticateUser, async (req, res) => {
    try {
        const user = await Controller.getUsers();
        
        res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
});

router.get("/profile", authenticateUser, async (req, res) => {
    try {
        const user = await Controller.setChallenges(req.user)

        res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
});

router.post("/solo_practice", authenticateUser, async (req, res) => {
    try {
        const { wpm, accuracy } = req.body;

        if (!wpm || !accuracy) {
            throw new Error("All fields are required");
        }

        const user = await Controller.soloPractice(req.user, wpm, accuracy);

        return res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
    
});

router.get("/admin", authenticateAdmin, async (req, res) => {
    try {
        const users = await Controller.getUsersAsAdmin();

        res.status(200).send(users);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
})

router.post("/admin", authenticateAdmin, async (req, res) => {
    try {
        const { email, username, password, role } = req.body;

        const user = await Controller.createUser(email, username, password, role);

        return res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
});

router.put("/admin/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new Error("ID is required");
        }

        if (id == req.user.id) {
            throw new Error("You cannot update your own account");
        }

        const { email, username, password, access_level } = req.body;

        const user = await Controller.updateUser(id, email, username, password, access_level);

        return res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
});

router.delete("/admin/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new Error("ID is required");
        }

        if (id == req.user.id) {
            throw new Error("You cannot update your own account");
        }

        const user = await Controller.deleteUser(id);

        return res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
