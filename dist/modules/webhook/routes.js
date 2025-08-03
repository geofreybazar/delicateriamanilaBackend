"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./controller"));
const WebhookRouter = express_1.default.Router();
WebhookRouter.post("/paymongowebhook", controller_1.default.acceptWebhookEndpoint);
exports.default = WebhookRouter;
