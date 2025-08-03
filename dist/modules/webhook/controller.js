"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const acceptWebhookEndpoint = async (req, res, next) => {
    const webhookBody = req.body;
    try {
        const webhook = await service_1.default.acceptWebhookEndpointService(webhookBody);
        res.status(200).json({ received: true });
        return;
    }
    catch (error) {
        console.error("Webhook processing failed:", error);
        res.status(200).json({ received: true });
    }
};
exports.default = {
    acceptWebhookEndpoint,
};
