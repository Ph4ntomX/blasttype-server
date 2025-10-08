const express = require("express");

const router = express.Router();
const Controller = require("../controllers/game");

router.get("/", async (req, res) => {
  try {
    const difficulty = req.query.difficulty;
    const page = req.query.page;
    const limit = req.query.limit;

    const games = await Controller.getGames({difficulty}, page, limit);

    if (!games) {
      return res.status(404).send("Games were not found");
    }
    
    res.status(200).send(games);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const game = await Controller.getGameById(id);

    if (!game) {
      return res.status(404).send("Game was not found");
    }
    
    res.status(200).send(game);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;