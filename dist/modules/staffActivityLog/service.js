"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const getStaffActivityLogsService = async (id) => {
    const staffLogs = await model_1.default.find({ staff: id })
        .populate("order", { referenceNumber: 1 })
        .sort({
        createdAt: -1,
    });
    return staffLogs;
};
exports.default = {
    getStaffActivityLogsService,
};
