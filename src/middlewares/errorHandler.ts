import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
  keyValue?: Record<string, string>;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.name === "CastError") {
    res.status(error.status || 500).json({ error: "Malformated ID" });
  } else if (error.name === "ValidationError") {
    res.status(error.status || 500).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    res.status(error.status || 500).json({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    res
      .status(error.status || 500)
      .json({ error: "token expired", code: "TOKEN_EXPIRED" });
  } else if (error.name === "MongoServerError") {
    if (error.keyValue) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[duplicateField];
      res.status(error.status || 500).json({
        error: `${duplicateValue} is already in use `,
      });
    }
    res.status(400).json({ error: "Duplicate key error" });
  } else if (error.name === "AuthenticationError") {
    res.status(error.status || 401).json({ error: error.message });
  } else if (error.name === "NotFoundError") {
    res.status(error.status || 500).json({ error: error.message });
  } else if (error.name === "NoEnoughStockError") {
    res.status(error.status || 500).json({ error: error.message });
  }

  next(error);
};
