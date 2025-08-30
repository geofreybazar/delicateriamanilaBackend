import { Request, Response, NextFunction } from "express";
import type { RequestWithUser } from "../../middlewares/authenticateToken";
import { AuthenticationError } from "../../config/AuthenticationError";
import service from "./service";

const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const orders = await service.getOrdersService(page, limit);
    res.status(200).json(orders);
    return;
  } catch (error) {
    next(error);
  }
};

const getPendingOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const orders = await service.getPendingOrdersService(page, limit);
    res.status(200).json(orders);
    return;
  } catch (error) {
    next(error);
  }
};

const getCompletedOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const orders = await service.getCompletedOrdersService(page, limit);
    res.status(200).json(orders);
    return;
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const order = await service.getOrderService(id);
    res.status(200).json(order);
    return;
  } catch (error) {
    next(error);
  }
};

const acceptOrder = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    throw new AuthenticationError("You are not authenticated");
  }

  const userId = req.user.id;

  const id = req.params.id;
  try {
    const acceptedOrder = await service.acceptOrderService(id, userId);
    res.status(200).json(acceptedOrder);
    return;
  } catch (error) {
    next(error);
  }
};

const getAcceptedOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const acceptedOrders = await service.getAcceptedOrderServices(page, limit);
    res.status(200).json(acceptedOrders);
    return;
  } catch (error) {
    next(error);
  }
};

const outForDelivery = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    throw new AuthenticationError("You are not authenticated");
  }

  const userId = req.user.id;
  const id = req.params.id;
  try {
    const orderForDelivery = await service.outForDeliveryService(id, userId);
    res.status(200).json(orderForDelivery);
    return;
  } catch (error) {
    next(error);
  }
};

const getForDeliveryOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const orderForDelivery = await service.getForDeliveryOrdersServices(
      page,
      limit
    );
    res.status(200).json(orderForDelivery);
    return;
  } catch (error) {
    next(error);
  }
};

const assignDeliveryRider = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    throw new AuthenticationError("You are not authenticated");
  }

  const userId = req.user.id;
  const body = req.body;
  try {
    const order = await service.assignDeliveryService(body, userId);
    res.status(200).json(order);
    return;
  } catch (error) {
    next(error);
  }
};

const getOngoingDeliveryOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const ongoingDeliveryOrders =
      await service.getOngoingDeliveryOrdersServices(page, limit);
    res.status(200).json(ongoingDeliveryOrders);
    return;
  } catch (error) {
    next(error);
  }
};

const readyForPickup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    throw new AuthenticationError("You are not authenticated");
  }

  const userId = req.user.id;
  const id = req.params.id;
  try {
    const orderForPickup = await service.readyForPickupService(id, userId);
    res.status(200).json(orderForPickup);
    return;
  } catch (error) {
    next(error);
  }
};

const getForPickupOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const forPickupOrders = await service.getForPickupOrdersService(
      page,
      limit
    );
    res.status(200).json(forPickupOrders);
    return;
  } catch (error) {
    next(error);
  }
};

const orderPickedup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    throw new AuthenticationError("You are not authenticated");
  }

  const userId = req.user.id;
  const body = req.body;
  try {
    const pickedupOrder = await service.orderPickedupService(body, userId);
    res.status(200).json(pickedupOrder);
    return;
  } catch (error) {
    next(error);
  }
};

const getTotalNumberOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const totalNumberOrders = await service.getTotalNumberOrdersService();
    res.status(200).json(totalNumberOrders);
    return;
  } catch (error) {
    next(error);
  }
};

const getRiderPendingDeliveries = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    throw new AuthenticationError("You are not authenticated");
  }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const id = req.user.id;

  try {
    const pendingDeliveries = await service.getRiderPendingDeliveriesService(
      id,
      page,
      limit
    );

    res.status(201).json(pendingDeliveries);
    return;
  } catch (error) {
    next(error);
  }
};

const orderDelivered = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    throw new AuthenticationError("You are not authenticated");
  }

  const userId = req.user.id;
  const id = req.params.id;

  try {
    const order = await service.orderDeliveredService(id, userId);
    res.status(201).json(order);
    return;
  } catch (error) {
    next(error);
  }
};

const getRiderDeliveredOrders = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    throw new AuthenticationError("You are not authenticated");
  }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const id = req.user.id;
  try {
    const myDeliveries = await service.getRiderDeliveredOrdersService(
      id,
      page,
      limit
    );
    res.status(201).json(myDeliveries);
    return;
  } catch (error) {
    next(error);
  }
};

const getRecentOrders = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const recentOrders = await service.getRecentOrdersService();
    res.status(201).json(recentOrders);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  getOrders,
  getPendingOrders,
  getCompletedOrders,
  getOrder,
  acceptOrder,
  getAcceptedOrders,
  outForDelivery,
  getForDeliveryOrders,
  assignDeliveryRider,
  getOngoingDeliveryOrders,
  readyForPickup,
  getForPickupOrders,
  orderPickedup,
  getTotalNumberOrders,
  getRiderPendingDeliveries,
  orderDelivered,
  getRiderDeliveredOrders,
  getRecentOrders,
};
