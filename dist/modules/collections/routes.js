"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const authenticateToken_1 = __importDefault(require("../../middlewares/authenticateToken"));
const CollectionsRouter = (0, express_1.Router)();
CollectionsRouter.post("/", authenticateToken_1.default, controller_1.default.addCollection);
CollectionsRouter.get("/", authenticateToken_1.default, controller_1.default.getCollections);
CollectionsRouter.get("/allcollections", controller_1.default.getAllColletions);
CollectionsRouter.get("/getcollectioname/:id", controller_1.default.getCollectionsName);
CollectionsRouter.get("/:id", authenticateToken_1.default, controller_1.default.getCollection);
CollectionsRouter.put("/:id", controller_1.default.updateCollection);
CollectionsRouter.delete("/", controller_1.default.deleteCollection);
exports.default = CollectionsRouter;
