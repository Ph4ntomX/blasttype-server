let Controller = {}
const Game = require("../models/schemas").Game;

Controller.getGames = async (rawFilter, page = 1, limit = 10) => {
    // pagination implemented

    let filter = {};
    
    if (rawFilter.difficulty) {
      filter["passage.difficulty"] = rawFilter.difficulty;
    }

    try {
        const games = await Game.find(filter).skip((page - 1) * limit).limit(limit);
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