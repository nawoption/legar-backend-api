const express = require("express");
const { body } = require("express-validator");
const { login } = require("../controllers/adminController");

const router = express.Router();

router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").notEmpty()], login);

module.exports = router;
