"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const addStoreSettings = async (req, res, next) => {
    const body = req.body;
    try {
        const savedStoreSettings = await service_1.default.addStoreSettingsService(body);
        res.status(201).json(savedStoreSettings);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getStoreSettings = async (req, res, next) => {
    const id = req.params.id;
    try {
        const storeSettings = await service_1.default.getStoreSettingsService(id);
        res.status(201).json(storeSettings);
        return;
    }
    catch (error) {
        next(error);
    }
};
const updateStoreSettings = async (req, res, next) => {
    const id = req.params.id;
    const body = req.body;
    try {
        const updatedStoreSettings = await service_1.default.updateStoreSettingsService(id, body);
        res.status(201).json(updatedStoreSettings);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    addStoreSettings,
    getStoreSettings,
    updateStoreSettings,
};
