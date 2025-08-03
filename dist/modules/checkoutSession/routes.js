"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./controller"));
const checkoutSessionRouter = express_1.default.Router();
checkoutSessionRouter.post("/", controller_1.default.createCheckoutSession);
checkoutSessionRouter.post("/paymentrequest", controller_1.default.createPaymongoPaymentRequest);
checkoutSessionRouter.get("/:id", controller_1.default.getCheckoutSession);
exports.default = checkoutSessionRouter;
