"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./controller"));
const CartStorageRouter = express_1.default.Router();
CartStorageRouter.post("/:id", controller_1.default.createCart);
CartStorageRouter.get("/:id", controller_1.default.getCart);
CartStorageRouter.put("/additemtocart", controller_1.default.addItem);
CartStorageRouter.put("/addquantity", controller_1.default.addQuantity);
CartStorageRouter.put("/minusquantity", controller_1.default.minusQuantity);
CartStorageRouter.delete("/removeitem", controller_1.default.removeItem);
exports.default = CartStorageRouter;
