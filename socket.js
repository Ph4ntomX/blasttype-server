// server.js (or inside socket.js if separated)
const { Server } = require("socket.io");

const Schemas = require("./models/schemas");
const User = Schemas.User; // adjust path

const Game = Schemas.Game;
const Passage = Schemas.Passage; // for assigning passages
const Stat = Schemas.Stat;

const jwt = require("jsonwebtoken");

const MINIMUM_PLAYERS = 1;
const COUNTDOWN = 0 //5;
const GAME_COUNTDOWN = 0 //3;
const GAME_TIMER = 60
const COUNTDOWN_SKIP = 0 //5;

// in-memory rooms
const rooms = {}; // { roomId: { players: [], countdown, interval, passage } }
let roomCounter = 1;

function createRoom() {
    const roomId = "room_" + roomCounter++;
    rooms[roomId] = {
        players: [],
        countdown: COUNTDOWN,
        interval: null,
        passage: null,
        winner: null,
        startedGameCountdown: false,
        started: false,
    };
    return rooms[roomId];
}

function getAvailableRoom() {
    // Find a room that hasn't started and has < 5 players
    for (let roomId in rooms) {
        const room = rooms[roomId];
        if (!room.startedGameCountdown && room.players.length < 5) {
            return room;
        }
    }
    return createRoom();
}

function initSocket(server) {
    const io = new Server(server, {
        cors: { origin: "*" },
    });

    const gameNamespace = io.of("/game");

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
        room.players.forEach((player) => {
            const stats = player.user.multiplayer_stats != null ? player.user.multiplayer_stats : new Stat({});

            stats.bestWPM = Math.max(stats.bestWPM, player.wpm);
            stats.gamesPlayed++;

            const previousAccuracy = stats.avgAccuracy * (stats.gamesPlayed - 1);
            stats.avgAccuracy = Math.round((previousAccuracy + player.accuracy) / stats.gamesPlayed);

            player.user.multiplayer_stats = stats;

            User.findByIdAndUpdate(player.user._id, { multiplayer_stats: stats }).then(() => {
                console.log(player.user.username + " updated stats");
            }).catch((error) => {
                console.log(error);
            });
        })

        Game.create({
            winner: room.winner.user,
            players: room.players.map((player) => player.user),
            passage: room.passage,
        });
    }

    async function startGame(room, roomId) {
        room.started = true;

        gameNamespace.to(roomId).emit("phase", "game");
        gameNamespace.to(roomId).emit("next_word", false);

        room.countdown = GAME_TIMER;

        room.interval = setInterval(() => {
            if (rooms[roomId] === null) {
                clearInterval(room.interval);
                return;
            }

            gameNamespace.to(roomId).emit("countdown", room.countdown);
            room.countdown--;

            if (room.countdown < 0) {
                clearInterval(room.interval);
                saveGame(room);
            }
        }, 1000);
    }

    async function startCountdown(room, roomId) {
        if (!room.passage) {
            // pick random passage (for now any difficulty)
            room.passage = await Passage.aggregate([{ $sample: { size: 1 } }]);
            room.passage = room.passage[0];
        }

        room.interval = setInterval(() => {
            if (rooms[roomId] === null) {
                clearInterval(room.interval);
                return;
            }
            gameNamespace.to(roomId).emit("countdown", room.countdown);
            room.countdown--;

            if (room.countdown < 0) {
                if (!room.startedGameCountdown) {
                    room.countdown = GAME_COUNTDOWN;
                    room.startedGameCountdown = true;

                    gameNamespace.to(roomId).emit("phase", "game_countdown");
                    gameNamespace.to(roomId).emit("start_game", {
                        passage: room.passage,
                        playerNames: room.players.map((player) => player.user.username),
                    });
                } else {
                    clearInterval(room.interval);
                    
                    startGame(room, roomId)
                }
            }
        }, 1000);
    }

    gameNamespace.use((socket, next) => {
        console.log(socket.handshake.auth)

        const token = socket.handshake.auth.token;
        try {
            const userWithId = jwt.verify(token, process.env.JWT_SECRET);

            socket.userId = userWithId.id; // { id, username, etc. }
            next();
        } catch (error) {
            console.log(error.message)
            next(new Error("Auth failed"));
        }
    });

    gameNamespace.on("connection", async (socket) => {
        const user = await User.findById(socket.userId); // from jwt middleware

        if (!user) {
            socket.disconnect();
            return;
        }

        // Assign player to a room
        const room = getAvailableRoom();
        const roomId = Object.keys(rooms).find((id) => rooms[id] === room);

        socket.user = user;

        room.players.push(socket);
        socket.join(roomId);
        socket.roomId = roomId;

        socket.emit("phase", "waiting");

        console.log(`${user.username} joined ${roomId}`);

        // If two players, start countdown at 30s
        if (room.players.length >= MINIMUM_PLAYERS) {
            startCountdown(room, roomId);
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

            
            gameNamespace.to(roomId).emit("update_player", {
                playerName: socket.user.username,
                progress: socket.progress,
                wpm: socket.wpm,
                accuracy: socket.accuracy
            });
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log(`${user.username} left ${roomId}`);
            room.players = room.players.filter((s) => s !== socket);

            const playersLeft = room.players.length || 0;

            if (room.started) {
                checkResults(room);
            }

            if (playersLeft <= 1) {
                console.log("Game ends")

                rooms[roomId] = null;
                roomCounter--;
            }
        });
    });
}

module.exports = initSocket;