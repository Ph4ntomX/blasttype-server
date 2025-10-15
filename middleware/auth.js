const jwt = require("jsonwebtoken");
const User = require("../models/schemas").User;

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user; // attach user object to the request
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role != "admin") return res.status(401).json({ message: "Unauthorized" });

        req.user = user; // attach user object to the request
        next();
    } catch (err) {
        console.error("Auth error:", err.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = {
    authenticateUser,
    authenticateAdmin
}