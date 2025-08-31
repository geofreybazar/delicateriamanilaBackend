"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./controller"));
const ClienUserRouter = express_1.default.Router();
ClienUserRouter.post("/signup", controller_1.default.signupClientUser);
ClienUserRouter.post("/login", controller_1.default.clientUserLogin);
ClienUserRouter.get("/", controller_1.default.getClientUsers);
ClienUserRouter.get("/getrecentclientusers", controller_1.default.getRecentClientUsers);
ClienUserRouter.get("/:email", controller_1.default.getClientUser);
ClienUserRouter.put("/updateclientuser", controller_1.default.updateClientUser);
exports.default = ClienUserRouter;
