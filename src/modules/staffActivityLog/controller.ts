import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "../../middlewares/authenticateToken";
import service from "./service";

const getStaffActivityLogs = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    const error: any = new Error("You are not authenticated");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }
  const id = req.user.id;

  try {
    const staffActivityLogs = await service.getStaffActivityLogsService(id);
    res.status(201).json(staffActivityLogs);
    return;
  } catch (error) {
    next(error);
  }
};

export default { getStaffActivityLogs };
