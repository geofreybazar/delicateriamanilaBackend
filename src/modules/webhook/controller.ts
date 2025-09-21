import { Request, Response, NextFunction } from "express";
import service from "./service";

const acceptWebhookEndpoint = async (
  req: Request,
  res: Response,
  _: NextFunction
) => {
  const webhookBody = req.body;

  try {
    await service.acceptWebhookEndpointService(webhookBody);

    res.status(200).json({ received: true });
    return;
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(200).json({ received: true });
  }
};

const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const payments = await service.getPaymentsService(page, limit);

    res.status(200).json(payments);
    return;
  } catch (error) {
    next(error);
  }
};

const getPayment = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  try {
    const payment = await service.getPaymentService(id);
    res.status(201).json(payment);
    return;
  } catch (error) {
    next(error);
  }
};

const getPaymentSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentSummary = await service.getPaymentSummaryService();
    res.status(201).json(paymentSummary);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  acceptWebhookEndpoint,
  getPayments,
  getPayment,
  getPaymentSummary,
};
