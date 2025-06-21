"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const authenticateToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        const error = new Error("Access token missing or expired");
        error.name = "TokenExpiredError";
        error.status = 401;
        return next(error);
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.default = authenticateToken;
