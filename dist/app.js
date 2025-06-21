"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config/config"));
const connectToDb_1 = __importDefault(require("./config/connectToDb"));
const multer_1 = __importDefault(require("./config/multer"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const unknownEndpoint_1 = __importDefault(require("./middlewares/unknownEndpoint"));
const errorHandler_1 = require("./middlewares/errorHandler");
const routes_1 = __importDefault(require("./modules/adminUsers/routes"));
const path_1 = require("path");
const MONGO_URI = config_1.default.MONGO_URI;
const app = (0, express_1.default)();
(0, connectToDb_1.default)(MONGO_URI);
morgan_1.default.token("body", function (req) {
    return JSON.stringify(req.body);
});
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)(":method :url :status :body"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static((0, path_1.resolve)("dist/public")));
app.use("/adminuser_api", multer_1.default.array("image"), routes_1.default);
try {
    app.get(/.*/, (req, res) => {
        res.sendFile((0, path_1.resolve)("dist/public/index.html")); // Serves SPA fallback
    });
}
catch (err) {
    console.error("app.get('*') route failed to register:", err);
}
app.use(unknownEndpoint_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
