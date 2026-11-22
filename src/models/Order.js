const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        device: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true, index: true },
        deviceId: { type: String, required: true, trim: true, index: true },
        paymentMethod: { type: String, enum: ["KBZPay", "WavePay"], required: true },
        transactionNumber: { type: String, required: true, trim: true, maxlength: 150 },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        reviewedAt: { type: Date, default: null },
        adminNote: { type: String, trim: true, maxlength: 500, default: "" },
    },
    { timestamps: true },
);

orderSchema.index({ deviceId: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);
