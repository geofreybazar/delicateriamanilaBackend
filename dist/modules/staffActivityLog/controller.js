"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const getStaffActivityLogs = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        const error = new Error("You are not authenticated");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const id = req.user.id;
    try {
        const staffActivityLogs = await service_1.default.getStaffActivityLogsService(id);
        res.status(201).json(staffActivityLogs);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = { getStaffActivityLogs };
