"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./config/config"));
const connectToDb_1 = __importDefault(require("./config/connectToDb"));
const multer_1 = __importDefault(require("./config/multer"));
// import { stockRelease } from "./config/cronJob";
const unknownEndpoint_1 = __importDefault(require("./middlewares/unknownEndpoint"));
const errorHandler_1 = require("./middlewares/errorHandler");
const routes_1 = __importDefault(require("./modules/adminUsers/routes"));
const routes_2 = __importDefault(require("./modules/products/routes"));
const routes_3 = __importDefault(require("./modules/collections/routes"));
const routes_4 = __importDefault(require("./modules/checkoutSession/routes"));
const routes_5 = __importDefault(require("./modules/orders/routes"));
const routes_6 = __importDefault(require("./modules/webhook/routes"));
const route_1 = __importDefault(require("./modules/cartStorage/route"));
const path_1 = require("path");
const MONGO_URI = config_1.default.MONGO_URI;
const app = (0, express_1.default)();
(0, connectToDb_1.default)(MONGO_URI);
// stockRelease();
morgan_1.default.token("body", function (req) {
    return JSON.stringify(req.body);
});
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)(":method :url :status :body"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static((0, path_1.resolve)("dist/public")));
app.use("/adminuser_api", multer_1.default.array("image"), routes_1.default);
app.use("/product_api", multer_1.default.array("image"), routes_2.default);
app.use("/collection_api", multer_1.default.single("image"), routes_3.default);
app.use("/checkoutsession_api", routes_4.default);
app.use("/order_api", multer_1.default.single("image"), routes_5.default);
app.use("/webhook_api", routes_6.default);
app.use("/cart_api", route_1.default);
try {
    app.get(/.*/, (_, res) => {
        res.sendFile((0, path_1.resolve)("dist/public/index.html"));
    });
}
catch (err) {
    console.error("app.get('*') route failed to register:", err);
}
app.use(unknownEndpoint_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
