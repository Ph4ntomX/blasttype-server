// server.js (or inside socket.js if separated)
const { Server } = require("socket.io");

const Schemas = require("./models/schemas");
const User = Schemas.User; // adjust path

const Game = Schemas.Game;
const Passage = Schemas.Passage; // for assigning passages
const Stat = Schemas.Stat;

const ChallengeController = require("./controllers/challenge");

const jwt = require("jsonwebtoken");

const MINIMUM_PLAYERS = 1;
const COUNTDOWN = 0 //5;
const GAME_COUNTDOWN = 0 //3;
const GAME_TIMER = 60
const COUNTDOWN_SKIP = 0 //5;

// in-memory rooms per difficulty
const roomsByDifficulty = {
    easy: {},
    medium: {},
    hard: {},
};
const roomCounters = {
    easy: 1,
    medium: 1,
    hard: 1,
};

function createRoom(difficulty) {
    const roomId = "room_" + roomCounters[difficulty]++;
    const newRoom = {
        type: difficulty,
        players: [],
        countdown: COUNTDOWN,
        interval: null,
        passage: null,
        winner: null,
        startedGameCountdown: false,
        started: false,
    };
    roomsByDifficulty[difficulty][roomId] = newRoom;
    return newRoom;
}

function getAvailableRoom(difficulty) {
    // Find a room that hasn't started and has < 5 players within the difficulty
    const table = roomsByDifficulty[difficulty];
    for (let roomId in table) {
        const room = table[roomId];
        if (room && !room.startedGameCountdown && room.players.length < 5) {
            return room;
        }
    }
    return createRoom(difficulty);
}

function initSocket(server) {
    const io = new Server(server, {
        cors: { origin: "*" },
    });

    // Dynamic namespaces for difficulty: /game/easy, /game/medium, /game/hard
    const gameNamespace = io.of(/^\/game\/(easy|medium|hard)$/);

    async function checkResults(room) {
        let playersCompleted = 0;

        room.players.forEach((player) => {
            if (player.progress >= 100) {
                playersCompleted++;

                if(room.winner == null) {
                    room.winner = player;
                }
            }
        });

        if (playersCompleted === room.players.length) {
            room.countdown = 0
        }
    }

    async function saveGame(room) {
        if(room.winner == null) {
            // get highest wpm player
            room.winner = room.players.reduce((a, b) => a.wpm > b.wpm ? a : b);
        }
        
        const fixedUsers = room.players.map((player) => {
            return {
                _id: player.user._id,
                username: player.user.username,
                wpm: player.wpm,
                accuracy: player.accuracy,
                progress: player.progress,
            }
        })

        room.players.forEach(async (player) => {
            console.log("checking foreach")

            let { daily_challenge, weekly_challenge } = await ChallengeController.getUserChallenge(player.user);

            const changeData = {
                wpm: player.wpm,
                accuracy: player.accuracy,
                playedGame: true,
                won: player.user._id === room.winner.user._id,
            }

            console.log(changeData)

            console.log("changing data")
            daily_challenge = ChallengeController.changeChallenge(daily_challenge, changeData);
            weekly_challenge = ChallengeController.changeChallenge(weekly_challenge, changeData);

            const multiplayer_stats = player.user.multiplayer_stats != null ? player.user.multiplayer_stats : new Stat({});

            multiplayer_stats.bestWPM = Math.max(multiplayer_stats.bestWPM, player.wpm);
            multiplayer_stats.gamesPlayed++;

            const previousAccuracy = multiplayer_stats.avgAccuracy * (multiplayer_stats.gamesPlayed - 1);
            multiplayer_stats.avgAccuracy = Math.round((previousAccuracy + player.accuracy) / multiplayer_stats.gamesPlayed);

            console.log(player.user.username + " updated stats")
            console.log(player.user)
            User.findByIdAndUpdate(player.user._id, { multiplayer_stats, daily_challenge, weekly_challenge }).then(() => {
                console.log(player.user.username + " updated stats");
            }).catch((error) => {
                console.log(error);
            });
        })

        Game.create({
            winner: fixedUsers.find((user) => user._id === room.winner.user._id),
            players: fixedUsers,
            passage: room.passage,
        });
    }

    async function startGame(room, roomId, namespace) {
        room.started = true;

        namespace.to(roomId).emit("phase", "game");
        namespace.to(roomId).emit("next_word", false);

        room.countdown = GAME_TIMER;

        room.interval = setInterval(() => {
            if (roomsByDifficulty[room.type][roomId] === null) {
                clearInterval(room.interval);
                return;
            }

            namespace.to(roomId).emit("countdown", room.countdown);
            room.countdown--;

            if (room.countdown < 0) {
                clearInterval(room.interval);
                saveGame(room);
            }
        }, 1000);
    }

    async function startCountdown(room, roomId, namespace) {
        if (!room.passage) {
            // pick random passage by difficulty
            if (["easy", "medium", "hard"].includes(room.type)) {
                room.passage = await Passage.aggregate([
                    { $match: { difficulty: room.type } },
                    { $sample: { size: 1 } },
                ]);
            } else {
                room.passage = await Passage.aggregate([{ $sample: { size: 1 } }]);
            }
            room.passage = room.passage[0];
        }

        room.interval = setInterval(() => {
            if (roomsByDifficulty[room.type][roomId] === null) {
                clearInterval(room.interval);
                return;
            }
            namespace.to(roomId).emit("countdown", room.countdown);
            room.countdown--;

            if (room.countdown < 0) {
                if (!room.startedGameCountdown) {
                    room.countdown = GAME_COUNTDOWN;
                    room.startedGameCountdown = true;

                    namespace.to(roomId).emit("phase", "game_countdown");
                    namespace.to(roomId).emit("start_game", {
                        passage: room.passage,
                        playerNames: room.players.map((player) => player.user.username),
                    });
                } else {
                    clearInterval(room.interval);
                    
                    startGame(room, roomId, namespace)
                }
            }
        }, 1000);
    }

    // Auth middleware for all difficulty namespaces
    gameNamespace.use((socket, next) => {
        const token = socket.handshake.auth.token;
        try {
            const userWithId = jwt.verify(token, process.env.JWT_SECRET);

            socket.userId = userWithId.id; // { id, username, etc. }
            next();
        } catch (error) {
            next(new Error("Auth failed"));
        }
    });

    // Handle connections per difficulty namespace
    gameNamespace.on("connection", async (socket) => {
        const namespace = socket.nsp;
        const difficulty = namespace.name.split("/").pop(); // easy | medium | hard
        const queryUser = await User.findById(socket.userId); // from jwt middleware

        if (!queryUser) {
            socket.disconnect();
            return;
        }

        const user = {
            _id: queryUser._id,
            username: queryUser.username,
            multiplayer_stats: queryUser.multiplayer_stats,
            daily_challenge: queryUser.daily_challenge,
            weekly_challenge: queryUser.weekly_challenge,
        }

        // Assign player to a room in the selected difficulty
        const room = getAvailableRoom(difficulty);
        const roomId = Object.keys(roomsByDifficulty[difficulty]).find((id) => roomsByDifficulty[difficulty][id] === room);

        socket.user = user;

        room.players.push(socket);
        socket.join(roomId);
        socket.roomId = roomId;

        socket.emit("phase", "waiting");

        console.log(`${user.username} joined ${roomId} (${difficulty})`);

        // If two players, start countdown at 30s
        if (room.players.length >= MINIMUM_PLAYERS) {
            startCountdown(room, roomId, namespace);
        }

        // If room becomes full, skip countdown to 5s
        if (room.players.length === 5 && room.countdown > COUNTDOWN_SKIP) {
            room.countdown = COUNTDOWN_SKIP;
        }

        let passages = null
        let passageIndex = 0

        let correctCharacters = 0
        let charactersTyped = 0

        socket.wpm = 0
        socket.accuracy = 0
        socket.progress = 0

        // Typing progress
        socket.on("typed_input", (data) => {
            if(!room.passage) {
                return;
            }

            const {word, elapsedTime } = data

            if(passages == null) {
                passages = room.passage.text.split(" ");
            }

            const currentWord = passages[passageIndex];

            for(let i = 0; i < word.length; i++ ) {
                if(word[i] === currentWord[i]) {
                    correctCharacters++;
                }

                charactersTyped++;
            }

            if(word == currentWord) {
                passageIndex++;

                if(passageIndex < passages.length) {
                    socket.emit("next_word", true);
                }
            } else {
                socket.emit("next_word", false);
            }

            socket.wpm = elapsedTime > 0 ? Math.round((passageIndex / elapsedTime) * 60) : 0;
            socket.accuracy = charactersTyped > 0 ? Math.round((correctCharacters / charactersTyped) * 100) : 0;
            socket.progress = Math.round((passageIndex / passages.length) * 100);

            if (socket.progress >= 100) {
                checkResults(room);
            }

            // emit socket room
            namespace.to(roomId).emit("update_player", {
                playerName: socket.user.username,
                progress: socket.progress,
                wpm: socket.wpm,
                accuracy: socket.accuracy
            });
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log(`${user.username} left ${roomId} (${difficulty})`);
            room.players = room.players.filter((s) => s !== socket);

            const playersLeft = room.players.length || 0;

            if (room.started) {
                checkResults(room);
            }

            if (playersLeft <= 1) {
                console.log("Game ends")

                roomsByDifficulty[difficulty][roomId] = null;
            }
        });
    });
}

module.exports = initSocket;