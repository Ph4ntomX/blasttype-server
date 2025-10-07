let Controller = {}

const User = require("../models/schemas").User;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

Controller.getUsers = async () => {
    const users = await User.find().sort({ _id: -1 });

    return users.map((user) => {
        return {
            _id: user._id,
            username: user.username,
            role: user.role,
        };
    });
;
};

Controller.getUserById = async (id) => {
    const user = await User.findById(id);

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

    if (username.length < 3) {
        throw new Error("Name must be at least 3 characters long");
    }

    if (email.length < 3) {
        throw new Error("Email must be at least 3 characters long");
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

Controller.signInUser = async (email, password) => {
    if (!email || !password) {
        throw new Error("All fields are required");
    }

    const user = await User.findOne({ email });
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

module.exports = Controller;
