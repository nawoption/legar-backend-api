const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
    {
        deviceId: { type: String, required: true, unique: true, trim: true },
        deviceInfo: {
            platform: { type: String, enum: ["android", "ios", "web", "other"], default: "other" },
            appVersion: { type: String, trim: true, default: "" },
            deviceName: { type: String, trim: true, default: "" },
            model: { type: String, trim: true, default: "" },
            manufacturer: { type: String, trim: true, default: "" },
            osVersion: { type: String, trim: true, default: "" },
        },
        trialStartedAt: { type: Date, required: true, default: Date.now },
        trialEndsAt: { type: Date, required: true },
        isActivated: { type: Boolean, default: false },
        lifetimePremiumAt: { type: Date, default: null },
        pendingPremiumOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
        lastSeenAt: { type: Date, default: Date.now },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

deviceSchema.index({ trialEndsAt: 1 });

deviceSchema.methods.refreshActivation = function () {
    const stillInTrial = this.trialEndsAt && this.trialEndsAt > new Date();
    const activated = Boolean(this.lifetimePremiumAt) || stillInTrial;
    this.isActivated = activated;
    return activated;
};

module.exports = mongoose.model("Device", deviceSchema);
