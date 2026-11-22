const { validationResult } = require("express-validator");
const Device = require("../models/Device");

const requireActiveDevice = async (req, res, next) => {
    try {
        const deviceId = req.headers["x-device-id"] || req.query.deviceId;
        if (!deviceId) return res.status(400).json({ message: "Device ID is required" });

        const device = await Device.findOne({ deviceId });
        if (!device) return res.status(404).json({ message: "Device is not registered" });

        const isActivated = device.refreshActivation();
        await device.save();
        if (!isActivated) return res.status(403).json({ message: "Free trial has ended", isActivated: false });

        req.device = device;
        next();
    } catch (error) {
        next(error);
    }
};

const getDeviceStatusByParam = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const device = await Device.findOne({ deviceId: req.params.deviceId });
        if (!device) return res.status(404).json({ message: "Device is not registered" });

        const isActivated = device.refreshActivation();
        await device.save();
        res.locals.deviceStatus = {
            deviceId: device.deviceId,
            trialStartedAt: device.trialStartedAt,
            trialEndsAt: device.trialEndsAt,
            lifetimePremiumAt: device.lifetimePremiumAt,
            isActivated,
        };
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { requireActiveDevice, getDeviceStatusByParam };
