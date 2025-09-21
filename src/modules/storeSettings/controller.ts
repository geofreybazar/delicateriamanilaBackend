import { Request, Response, NextFunction } from "express";
import service from "./service";

const addStoreSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;

  try {
    const savedStoreSettings = await service.addStoreSettingsService(body);
    res.status(201).json(savedStoreSettings);
    return;
  } catch (error) {
    next(error);
  }
};

const getStoreSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  try {
    const storeSettings = await service.getStoreSettingsService(id);
    res.status(201).json(storeSettings);
    return;
  } catch (error) {
    next(error);
  }
};

const updateStoreSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const body = req.body;

  try {
    const updatedStoreSettings = await service.updateStoreSettingsService(
      id,
      body
    );
    res.status(201).json(updatedStoreSettings);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  addStoreSettings,
  getStoreSettings,
  updateStoreSettings,
};
