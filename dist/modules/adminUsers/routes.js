"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const authenticateToken_1 = __importDefault(require("../../middlewares/authenticateToken"));
const AdminUserRouter = (0, express_1.Router)();
AdminUserRouter.post("/", authenticateToken_1.default, controller_1.default.createAdminUser);
AdminUserRouter.post("/login", controller_1.default.login);
AdminUserRouter.post("/logout", authenticateToken_1.default, controller_1.default.logout);
AdminUserRouter.get("/", authenticateToken_1.default, controller_1.default.getLoggedInUser);
AdminUserRouter.put("/upadateuser", authenticateToken_1.default, controller_1.default.updateUserInfo);
AdminUserRouter.put("/changepassword", authenticateToken_1.default, controller_1.default.changePassword);
AdminUserRouter.post("/refreshtoken", controller_1.default.generateRefreshToken);
exports.default = AdminUserRouter;
