"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const AppError_1 = require("./AppError");
class NotFoundError extends AppError_1.AppError {
    constructor(message = "Validation failed") {
        super(message, 400, "NotFoundError");
    }
}
exports.NotFoundError = NotFoundError;
