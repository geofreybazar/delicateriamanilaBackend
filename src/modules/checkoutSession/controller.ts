import { Request, Response, NextFunction } from "express";
import service from "./service";

const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;

  try {
    const checkoutSession = await service.createCheckoutSessionService(body);
    res.status(201).json(checkoutSession);
    return;
  } catch (error) {
    next(error);
  }
};

const getCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const checkoutSession = await service.getCheckoutSessionService(id);
    res.status(200).json(checkoutSession);
    return;
  } catch (error) {
    next(error);
  }
};

const createPaymongoPaymentRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  try {
    const paymongoPayment = await service.createPaymongoPaymentRequestService(
      body
    );

    res.status(200).json(paymongoPayment);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  createCheckoutSession,
  getCheckoutSession,
  createPaymongoPaymentRequest,
};
