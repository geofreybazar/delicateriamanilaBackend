"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const acceptWebhookEndpoint = async (req, res, _) => {
    const webhookBody = req.body;
    try {
        await service_1.default.acceptWebhookEndpointService(webhookBody);
        res.status(200).json({ received: true });
        return;
    }
    catch (error) {
        console.error("Webhook processing failed:", error);
        res.status(200).json({ received: true });
    }
};
const getPayments = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const payments = await service_1.default.getPaymentsService(page, limit);
        res.status(200).json(payments);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getPayment = async (req, res, next) => {
    const id = req.params.id;
    try {
        const payment = await service_1.default.getPaymentService(id);
        res.status(201).json(payment);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getPaymentSummary = async (req, res, next) => {
    try {
        const paymentSummary = await service_1.default.getPaymentSummaryService();
        res.status(201).json(paymentSummary);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    acceptWebhookEndpoint,
    getPayments,
    getPayment,
    getPaymentSummary,
};
