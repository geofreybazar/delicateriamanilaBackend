"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const createCheckoutSession = async (req, res, next) => {
    const body = req.body;
    try {
        const checkoutSession = await service_1.default.createCheckoutSessionService(body);
        res.status(201).json(checkoutSession);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getCheckoutSession = async (req, res, next) => {
    const id = req.params.id;
    try {
        const checkoutSession = await service_1.default.getCheckoutSessionService(id);
        res.status(200).json(checkoutSession);
        return;
    }
    catch (error) {
        next(error);
    }
};
const createPaymongoPaymentRequest = async (req, res, next) => {
    const body = req.body;
    try {
        const paymongoPayment = await service_1.default.createPaymongoPaymentRequestService(body);
        res.status(200).json(paymongoPayment);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createCheckoutSession,
    getCheckoutSession,
    createPaymongoPaymentRequest,
};
