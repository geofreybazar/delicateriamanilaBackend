"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./controller"));
const authenticateToken_1 = __importDefault(require("../../middlewares/authenticateToken"));
const WebhookRouter = express_1.default.Router();
WebhookRouter.post("/paymongowebhook", controller_1.default.acceptWebhookEndpoint);
WebhookRouter.get("/getpayments", authenticateToken_1.default, controller_1.default.getPayments);
WebhookRouter.get("/getpaymentsummary", authenticateToken_1.default, controller_1.default.getPaymentSummary);
WebhookRouter.get("/:id", authenticateToken_1.default, controller_1.default.getPayment);
exports.default = WebhookRouter;
