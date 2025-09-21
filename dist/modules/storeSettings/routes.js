"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./controller"));
const authenticateToken_1 = __importDefault(require("../../middlewares/authenticateToken"));
const StoreSettingsRouter = express_1.default.Router();
StoreSettingsRouter.post("/", authenticateToken_1.default, controller_1.default.addStoreSettings);
StoreSettingsRouter.get("/:id", controller_1.default.getStoreSettings);
StoreSettingsRouter.put("/:id", authenticateToken_1.default, controller_1.default.updateStoreSettings);
exports.default = StoreSettingsRouter;
