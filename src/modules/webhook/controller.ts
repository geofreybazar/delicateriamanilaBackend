import { Request, Response, NextFunction } from "express";
import service from "./service";

const acceptWebhookEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const webhookBody = req.body;

  try {
    const webhook = await service.acceptWebhookEndpointService(webhookBody);

    res.status(200).json({ received: true });
    return;
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(200).json({ received: true });
  }
};

export default {
  acceptWebhookEndpoint,
};
