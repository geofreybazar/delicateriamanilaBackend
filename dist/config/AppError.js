"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, status, name = "AppError") {
        super(message);
        this.status = status;
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
