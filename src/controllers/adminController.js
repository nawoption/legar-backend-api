const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const admin = await Admin.findOne({ email: req.body.email.toLowerCase().trim() }).select("+password");
        if (!admin || !(await admin.comparePassword(req.body.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({ token: signToken(admin._id), admin: { id: admin._id, name: admin.name, email: admin.email } });
    } catch (error) {
        next(error);
    }
};

module.exports = { login };
