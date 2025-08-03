"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    if (error.name === "CastError") {
        res.status(error.status || 500).json({ error: "Malformated ID" });
    }
    else if (error.name === "ValidationError") {
        res.status(error.status || 500).json({ error: error.message });
    }
    else if (error.name === "JsonWebTokenError") {
        res.status(error.status || 500).json({ error: error.message });
    }
    else if (error.name === "TokenExpiredError") {
        res
            .status(error.status || 500)
            .json({ error: "token expired", code: "TOKEN_EXPIRED" });
    }
    else if (error.name === "MongoServerError") {
        if (error.keyValue) {
            const duplicateField = Object.keys(error.keyValue)[0];
            const duplicateValue = error.keyValue[duplicateField];
            res.status(error.status || 500).json({
                error: `${duplicateValue} is already in use `,
            });
        }
        res.status(400).json({ error: "Duplicate key error" });
    }
    else if (error.name === "AuthenticationError") {
        res.status(error.status || 401).json({ error: error.message });
    }
    else if (error.name === "NotFoundError") {
        res.status(error.status || 500).json({ error: error.message });
    }
    else if (error.name === "NoEnoughStockError") {
        res.status(error.status || 500).json({ error: error.message });
    }
    next(error);
};
exports.errorHandler = errorHandler;
