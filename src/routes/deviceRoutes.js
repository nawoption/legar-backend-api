const express = require("express");
const { body, param } = require("express-validator");
const { registerOrActivateDevice, getDeviceStatus } = require("../controllers/deviceController");
const { getDeviceStatusByParam } = require("../middleware/device");

const router = express.Router();

router.post(
    "/activate",
    [
        body("deviceId").trim().notEmpty().isLength({ min: 3, max: 150 }),
        body("deviceInfo.platform").optional().isIn(["android", "ios", "web", "other"]),
        body("deviceInfo.appVersion").optional().trim().isLength({ max: 30 }),
        body("deviceInfo.deviceName").optional().trim().isLength({ max: 150 }),
        body("deviceInfo.model").optional().trim().isLength({ max: 150 }),
        body("deviceInfo.manufacturer").optional().trim().isLength({ max: 150 }),
        body("deviceInfo.osVersion").optional().trim().isLength({ max: 50 }),
    ],
    registerOrActivateDevice,
);

router.get("/:deviceId", [param("deviceId").trim().notEmpty()], getDeviceStatusByParam, getDeviceStatus);

module.exports = router;
