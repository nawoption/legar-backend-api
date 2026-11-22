const { validationResult } = require("express-validator");
const Device = require("../models/Device");
const Order = require("../models/Order");

const PAYMENT_METHODS = [
    { id: "KBZPay", name: "KBZ Pay", accountName: "Legar App", accountNumber: process.env.KBZPAY_ACCOUNT || "" },
    { id: "WavePay", name: "Wave Pay", accountName: "Legar App", accountNumber: process.env.WAVEPAY_ACCOUNT || "" },
];

const getPaymentMethods = (req, res) => res.json(PAYMENT_METHODS);

const createOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const device = await Device.findOne({ deviceId: req.body.deviceId });
        if (!device) return res.status(404).json({ message: "Device is not registered" });
        if (device.lifetimePremiumAt) return res.status(409).json({ message: "Lifetime premium is already active" });

        const pending = await Order.findOne({ device: device._id, status: "pending" });
        if (pending) return res.status(409).json({ message: "A premium order is already pending" });

        const duplicate = await Order.findOne({
            transactionNumber: req.body.transactionNumber.trim(),
            status: { $in: ["pending", "approved"] },
        });
        if (duplicate) return res.status(409).json({ message: "Transaction number has already been submitted" });

        const order = await Order.create({
            device: device._id,
            deviceId: device.deviceId,
            paymentMethod: req.body.paymentMethod,
            transactionNumber: req.body.transactionNumber.trim(),
        });

        device.pendingPremiumOrder = order._id;
        await device.save();
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ deviceId: req.params.deviceId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        const filter = req.query.status ? { status: req.query.status } : {};
        const orders = await Order.find(filter)
            .populate("device", "deviceId deviceInfo isActivated lifetimePremiumAt")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const reviewOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.status !== "pending") return res.status(400).json({ message: "Order has already been reviewed" });

        order.status = req.body.status;
        order.adminNote = req.body.adminNote || "";
        order.reviewedBy = req.admin._id;
        order.reviewedAt = new Date();
        await order.save();

        const device = await Device.findById(order.device);
        if (device) {
            if (order.status === "approved") {
                device.lifetimePremiumAt = new Date();
                device.isActivated = true;
            }
            device.pendingPremiumOrder = null;
            await device.save();
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
};

module.exports = { getPaymentMethods, createOrder, getMyOrders, getAllOrders, reviewOrder };
