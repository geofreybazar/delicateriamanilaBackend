import { Request, Response, NextFunction } from "express";
import service from "./service";

const getDeliveryLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const deliveryLogs = await service.getDeliveryLogsService(id);
    console.log(deliveryLogs);
    res.status(201).json(deliveryLogs);
    return;
  } catch (error) {
    next(error);
  }
};

export default { getDeliveryLogs };
