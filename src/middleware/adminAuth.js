const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protectAdmin = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Admin authentication required" });
        }

        const decoded = jwt.verify(authorization.split(" ")[1], process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(401).json({ message: "Admin no longer exists" });

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired admin token" });
    }
};

module.exports = protectAdmin;
