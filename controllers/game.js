let Controller = {}
const Game = require("../models/schemas").Game;

Controller.getGames = async (rawFilter, page = 1, limit = 10, sort = "date") => {
    // pagination implemented

    let filter = {};
    let sorting = {}
    
    if (rawFilter.difficulty) {
      filter["passage.difficulty"] = rawFilter.difficulty;
    }

    if (rawFilter.search) {
        filter["winner.username"] = { $regex: rawFilter.search, $options: "i" };
    }

    if (sort === "date") {
        sorting["playedAt"] = -1;
    } else if (sort === "wpm") {
        sorting["winner.wpm"] = -1;
    } else if (sort === "accuracy") {
        sorting["winner.accuracy"] = -1;
    }

    try {
        const games = await Game.find(filter).skip((page - 1) * limit).limit(limit).sort(sorting);
        return games;
    } catch (error) {
        return;
    }
}

Controller.getGameById = async (id) => {
    try {
        const game = await Game.findById(id);
        return game;
    } catch (error) {
        return;
    }
}

module.exports = Controller;