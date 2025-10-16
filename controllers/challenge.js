let Controller = {}
const Challenge = require("../models/schemas").Challenge;

const dayLength = 24 * 60 * 60 * 1000;

Controller.getUserChallenge = async (User) => {
    let daily_challenge = User.daily_challenge;
    let weekly_challenge = User.weekly_challenge;

    if(daily_challenge == null || daily_challenge.expiresAt < new Date()) {
        daily_challenge = await Challenge.aggregate([ { $match: { period: "daily" } }, { $sample: { size: 10 } }]);

        daily_challenge = daily_challenge[0];

        daily_challenge.completed = false;
        daily_challenge.currentValue = 0;
        daily_challenge.expiresAt = new Date(new Date().getTime() + dayLength);
    }

    if(weekly_challenge == null || weekly_challenge.expiresAt < new Date()) {
        weekly_challenge = await Challenge.aggregate([ { $match: { period: "weekly" } }, { $sample: { size: 10 } }]);
        weekly_challenge = weekly_challenge[0];

        weekly_challenge.completed = false;
        weekly_challenge.currentValue = 0;
        weekly_challenge.expiresAt = new Date(new Date().getTime() + 7 * dayLength);
    }

    return { daily_challenge, weekly_challenge };
}

Controller.changeChallenge = (challenge, data) => {
    if(challenge.completed == true) return challenge;

    const { wpm, accuracy, playedGame, won } = data;

    switch(challenge.type) {
        case "wpm":
            challenge.currentValue = wpm;
            break;
        case "accuracy":
            challenge.currentValue = accuracy;
            break;
        case "games_played":
            if(playedGame) challenge.currentValue++;
            break;
        case "win":
            if(won) challenge.currentValue++;
            break;
        case "win_streak":
            if(won) challenge.currentValue++;
            else challenge.currentValue = 0;
            break;
        default:
            break;
    }

    if(challenge.currentValue >= challenge.targetValue) {
        challenge.completed = true;
    }

    return challenge;
}

Controller.getChallenges = async (params) => {
    const { type, search } = params;

    let query = {};
    if(type) query.type = type;
    if(search) query.text = { $regex: search, $options: "i" };

    const challenges = await Challenge.find(query);

    return challenges;
}

Controller.createChallenge = async (params) => {
    try {
        const newChallenge = await Challenge.create(params);
        return newChallenge;
    } catch (error) {
        return;
    }
}


Controller.updateChallenge = async (id, params) => {
    try {
        const updatedChallenge = await Challenge.findByIdAndUpdate(id, params, { new: true });
        return updatedChallenge;
    } catch (error) {
        return;
    }
}

Controller.deleteChallenge = async (id) => {
    try {
        const deletedChallenge = await Challenge.findByIdAndDelete(id);
        return deletedChallenge;
    } catch (error) {
        return;
    }
}

module.exports = Controller
