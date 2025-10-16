let Controller = {}


const { User, Stat } = require("../models/schemas");
const ChallengeController = require("./challenge");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

Controller.getUsers = async () => {
    const users = await User.find().sort({ _id: -1 });

    return users.map((user) => {
        return {
            _id: user._id,
            username: user.username,
            role: user.role,
            multiplayer_stats: user.multiplayer_stats,
        };
    });
};

Controller.getUser = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        throw new Error("User not found");
    }

    return {
        _id: user._id,
        username: user.username,
        role: user.role,
    };
};

Controller.signUpUser = async (username, email, password) => {
    if (!username || !email || !password) {
        throw new Error("All fields are required");
    }

    if (username.length < 3 || username.length > 20) {
        throw new Error("Name must be between 3 and 20 characters long");
    }

    if (email.length < 3 || email.length > 30) {
        throw new Error("Email must be between 3 and 30 characters long");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    if (await User.findOne({ username })) {
        throw new Error("Username already exists");
    }

    if (await User.findOne({ email })) {
        throw new Error("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // generate token


    const user = await User.create({ username, email, passwordHash });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    user.token = token;

    await user.save();
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
    };
};

Controller.signInUser = async (username, password) => {
    if (!username || !password) {
        throw new Error("All fields are required");
    }

    const user = await User.findOne({ username });
    if (!user) {
        throw new Error("User not found");
    }

    const hashTest = await bcrypt.compare(password, user.passwordHash);
    if (!hashTest) {
        throw new Error("Invalid password");
    }

    // generate token

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    user.token = token;

    await user.save();

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
    };
};

Controller.soloPractice = async (user, wpm, accuracy) => {
    const solo_stats = user.solo_stats != null ? user.solo_stats : new Stat({});

    solo_stats.bestWPM = Math.max(solo_stats.bestWPM, wpm);
    solo_stats.gamesPlayed++;

    const previousAccuracy = solo_stats.avgAccuracy * (solo_stats.gamesPlayed - 1);
    solo_stats.avgAccuracy = Math.round((previousAccuracy + accuracy) / solo_stats.gamesPlayed);

    return await User.findByIdAndUpdate(user._id, { solo_stats }, { new: true });
}

Controller.setChallenges = async (user) => {
    const { daily_challenge, weekly_challenge } = await ChallengeController.getUserChallenge(user);

    return await User.findByIdAndUpdate(user._id, { daily_challenge, weekly_challenge }, { new: true });
}

Controller.getUsersAsAdmin = async () => {
    const users = await User.find().sort({ _id: -1 });

    return users;
};

Controller.getUserAsAdmin = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

Controller.createUser = async (email, username, password, role) => {
    const user = await Controller.signUpUser(email, username, password);

    return await User.findByIdAndUpdate(user._id, { access_level: role }, { new: true });
};

Controller.updateUser = async (id, email, username, password, role) => {
    console.log(id, email, username, password, role);

    const user = await User.findById(id);

    if (!user) {
        throw new Error("User not found");
    }

    if (username) {
        if (username.length < 3 || username.length > 20) {
            throw new Error("Name must be between 3 and 20 characters long");
        }
        
        user.username = username;
    }
    
    if (email) {
        if (email.length < 3 || email.length > 30) {
            throw new Error("Email must be between 3 and 30 characters long");
        }

        user.email = email;
    }
    
    if (password) {
        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
    }
    
    if (role) {
        user.access_level = role;
    }

    await user.save();

    return user;
};

Controller.deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

module.exports = Controller;
