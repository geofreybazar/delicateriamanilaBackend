"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const authenticateToken_1 = __importDefault(require("../../middlewares/authenticateToken"));
const ProductsRouter = (0, express_1.Router)();
ProductsRouter.post("/", authenticateToken_1.default, controller_1.default.addProduct);
ProductsRouter.get("/", controller_1.default.getProducts);
ProductsRouter.get("/getshopproducts", controller_1.default.getShopProducts);
ProductsRouter.get("/getfeaturedproducts", controller_1.default.getFeaturedProducts);
ProductsRouter.get("/getshopfeaturedproducts", controller_1.default.getShopFeaturedProducts);
ProductsRouter.get("/:id", authenticateToken_1.default, controller_1.default.getProduct);
ProductsRouter.put("/:id", authenticateToken_1.default, controller_1.default.updateProduct);
ProductsRouter.delete("/", controller_1.default.deleteProducts);
exports.default = ProductsRouter;
