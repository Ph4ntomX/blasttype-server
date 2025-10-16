const express = require("express");

const router = express.Router();
const Controller = require("../controllers/challenge");
const { authenticateAdmin } = require("../middleware/auth");

router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const challenges = await Controller.getChallenges({type: req.query.type, search: req.query.search});

    if (!challenges) {
      return res.status(404).send("Challenges were not found");
    }
    
    res.status(200).send(challenges);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", authenticateAdmin, async (req, res) => {
  try {
    console.log(req.body)
    const { type, targetValue, period, goal } = req.body;

    if (!req.body) {
      return res.status(400).send("No data provided");
    }

    const challenge = await Controller.createChallenge({ type, targetValue, period, goal });

    if (!challenge) {
      return res.status(404).send("Challenge was not created");
    }
    
    res.status(200).send(challenge);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})

router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    if (!req.body) {
      return res.status(400).send("No data provided");
    }
    
    const challenge = await Controller.updateChallenge(id, req.body);

    if (!challenge) {
      return res.status(404).send("Challenge was not found and updated");
    }

    res.status(200).send(challenge);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})

router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const challenge = await Controller.deleteChallenge(id);

    if (!challenge) {
      return res.status(404).send("Challenge was not found and deleted");
    }

    res.status(200).send(challenge);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router;