import { Request, Response, NextFunction } from "express";
import service from "./service";

const createCart = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  console.log(id);
  try {
    const newCart = await service.createCartService(id);
    res.status(201).json(newCart);
    return;
  } catch (error) {
    next(error);
  }
};

const getCart = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  try {
    const cart = await service.getCartService(id);
    res.status(200).json(cart);
    return;
  } catch (error) {
    next(error);
  }
};

const addItem = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  try {
    const updatedCart = await service.addItemService(body);
    res.status(200).json(updatedCart);
    return;
  } catch (error) {
    next(error);
  }
};

const addQuantity = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  try {
    const upatedCart = await service.addQuantiyService(body);
    res.status(200).json(upatedCart);
    return;
  } catch (error) {
    next(error);
  }
};

const minusQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  try {
    const upatedCart = await service.minusQuantityService(body);
    res.status(200).json(upatedCart);
    return;
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  try {
    const upatedCart = await service.removeItemService(body);
    res.status(200).json(upatedCart);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  createCart,
  getCart,
  addItem,
  addQuantity,
  minusQuantity,
  removeItem,
};
