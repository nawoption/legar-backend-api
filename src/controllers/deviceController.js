const { validationResult } = require("express-validator");
const Device = require("../models/Device");

const trialDurationMs = 7 * 24 * 60 * 60 * 1000;

const registerOrActivateDevice = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { deviceId, deviceInfo = {} } = req.body;
        const now = new Date();

        let device = await Device.findOne({ deviceId });
        if (!device) {
            const trialEndsAt = new Date(now.getTime() + trialDurationMs);
            device = await Device.create({
                deviceId,
                deviceInfo,
                trialStartedAt: now,
                trialEndsAt,
                isActivated: true,
            });
        } else {
            device.deviceInfo = { ...device.deviceInfo.toObject?.(), ...deviceInfo };
            device.lastSeenAt = now;
            await device.save();
        }

        const isActivated = device.refreshActivation();
        await device.save();

        res.json({
            deviceId: device.deviceId,
            subscriptionStatus: device.getSubscriptionStatus(),
            trialStartedAt: device.trialStartedAt,
            trialEndsAt: device.trialEndsAt,
            trialRemainingMs: device.getTrialRemainingMs(),
            lifetimePremiumAt: device.lifetimePremiumAt,
            isActivated,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Device is already registered" });
        }
        next(error);
    }
};

const getDeviceStatus = async (req, res) => {
    res.json(res.locals.deviceStatus);
};

module.exports = { registerOrActivateDevice, getDeviceStatus };
