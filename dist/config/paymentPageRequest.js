"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentPageRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
const PAYMONGO_SECRET_KEY_TEST_BASE64 = config_1.default.PAYMONGO_SECRET_KEY_TEST_BASE64;
const axiosConfig = {
    headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Basic ${PAYMONGO_SECRET_KEY_TEST_BASE64}`,
    },
};
const paymentPageRequest = async (paymentDetails) => {
    const response = await axios_1.default.post(`https://api.paymongo.com/v1/checkout_sessions`, paymentDetails, axiosConfig);
    return response.data;
};
exports.paymentPageRequest = paymentPageRequest;
