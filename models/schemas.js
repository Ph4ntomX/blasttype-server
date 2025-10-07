const { Schema, model } = require("mongoose");

const statSchema = new Schema({
  gamesPlayed: { type: Number, default: 0 },
  bestWPM: { type: Number, default: 0 },
  avgAccuracy: { type: Number, default: 0 }
});

const challengeSchema = new Schema({
  period: { type: String, enum: ["daily", "weekly"], default: "daily", required: true },
  type: { type: String, enum: ["wpm", "accuracy", "games_played", "win", "win_streak"], default: "wpm", required: true },
  goal: { type: String, required: true },
  currentValue: { type: Number, default: 0, required: true },
  targetValue: { type: Number, default: 0, required: true },
  completed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  access_level: { // enum user, admin
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },
  solo_stats: statSchema,
  multiplayer_stats: statSchema,
  daily_challenge: challengeSchema,
  weekly_challenge: challengeSchema,
});

const passagesSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  addedBy: userSchema,
});

const gameSchema = new Schema({
  winner: userSchema,
  players: [userSchema],
  passage: passagesSchema,
  playedAt: { type: Date, default: Date.now },
})

const User = model("User", userSchema);
const Stat = model("Stat", statSchema);
const Challenge = model("Challenge", challengeSchema);
const Passage = model("Passage", passagesSchema);
const Game = model("Game", gameSchema);

module.exports = {
  User,
  Stat,
  Challenge,
  Passage,
  Game,
};