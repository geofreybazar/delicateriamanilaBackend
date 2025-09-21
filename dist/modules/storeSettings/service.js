"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const ValidationError_1 = require("../../config/ValidationError");
const validation_1 = require("./validation");
const revalidateTag_1 = require("../../config/revalidateTag");
const addStoreSettingsService = async (body) => {
    const parsed = validation_1.storeSettingsSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Data Inputs");
    }
    const data = parsed.data;
    const savedStoreSettings = await model_1.default.create(data);
    return savedStoreSettings;
};
const getStoreSettingsService = async (id) => {
    if (!id) {
        throw new ValidationError_1.ValidationError("No StoreSettings Id");
    }
    const storeSettings = await model_1.default.findById(id);
    return storeSettings;
};
const updateStoreSettingsService = async (id, body) => {
    if (!id) {
        throw new ValidationError_1.ValidationError("No StoreSettings Id");
    }
    const parsed = validation_1.storeSettingsSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Data Inputs");
    }
    const data = parsed.data;
    const updatedStoreSettings = await model_1.default.findByIdAndUpdate(id, data);
    await (0, revalidateTag_1.revalidateTag)("storesettings");
    return updatedStoreSettings;
};
exports.default = {
    addStoreSettingsService,
    getStoreSettingsService,
    updateStoreSettingsService,
};
