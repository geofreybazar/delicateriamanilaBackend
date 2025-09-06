import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "../../middlewares/authenticateToken";
import service from "./service";

const getStaffActivityLogs = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  console.log("here");
  try {
    const staffActivityLogs = await service.getStaffActivityLogsService(id);
    res.status(201).json(staffActivityLogs);
    return;
  } catch (error) {
    next(error);
  }
};

export default { getStaffActivityLogs };
