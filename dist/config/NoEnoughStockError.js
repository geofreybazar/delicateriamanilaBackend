"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoEnoughStockError = void 0;
const AppError_1 = require("./AppError");
class NoEnoughStockError extends AppError_1.AppError {
    constructor(message = "Validation failed") {
        super(message, 400, "NoEnoughStockError");
    }
}
exports.NoEnoughStockError = NoEnoughStockError;
