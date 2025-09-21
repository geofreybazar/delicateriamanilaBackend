"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const getDeliveryLogs = async (req, res, next) => {
    const id = req.params.id;
    try {
        const deliveryLogs = await service_1.default.getDeliveryLogsService(id);
        console.log(deliveryLogs);
        res.status(201).json(deliveryLogs);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = { getDeliveryLogs };
