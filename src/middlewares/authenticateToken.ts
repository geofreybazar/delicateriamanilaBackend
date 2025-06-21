import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "./errorHandler";

export interface RequestWithUser extends Request {
  user?: string | JwtPayload;
}

const authenticateToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;

  if (!token) {
    const error: AppError = new Error("Access token missing or expired");
    error.name = "TokenExpiredError";
    error.status = 401;
    return next(error);
  }

  try {
    const user = jwt.verify(token, config.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default authenticateToken;
