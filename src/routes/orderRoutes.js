const express = require("express");
const { body, param } = require("express-validator");
const protectAdmin = require("../middleware/adminAuth");
const {
    getPaymentMethods,
    createOrder,
    getMyOrders,
    getAllOrders,
    reviewOrder,
} = require("../controllers/orderController");

const router = express.Router();

// public routes

// get payment methods
router.get("/payment-methods", getPaymentMethods);
// create order
router.post(
    "/",
    [
        body("deviceId").trim().notEmpty().isLength({ min: 3, max: 150 }),
        body("paymentMethod").isIn(["KBZPay", "WavePay"]),
        body("transactionNumber").trim().notEmpty().isLength({ min: 3, max: 150 }),
    ],
    createOrder,
);
// get my orders
router.get("/device/:deviceId", [param("deviceId").trim().notEmpty()], getMyOrders);

// admin routes

// get all orders
router.get("/admin/all", protectAdmin, getAllOrders);
// review order
router.patch(
    "/admin/:id/review",
    protectAdmin,
    [body("status").isIn(["approved", "rejected"]), body("adminNote").optional().trim().isLength({ max: 500 })],
    reviewOrder,
);

module.exports = router;
