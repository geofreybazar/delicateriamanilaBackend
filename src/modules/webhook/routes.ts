import express from "express";
import controller from "./controller";
import authenticateToken from "../../middlewares/authenticateToken";

const WebhookRouter = express.Router();

WebhookRouter.post("/paymongowebhook", controller.acceptWebhookEndpoint);
WebhookRouter.get("/getpayments", authenticateToken, controller.getPayments);
WebhookRouter.get(
  "/getpaymentsummary",
  authenticateToken,
  controller.getPaymentSummary
);
WebhookRouter.get("/:id", authenticateToken, controller.getPayment);

export default WebhookRouter;
