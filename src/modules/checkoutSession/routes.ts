import express from "express";
import controller from "./controller";

const checkoutSessionRouter = express.Router();

checkoutSessionRouter.post("/", controller.createCheckoutSession);
checkoutSessionRouter.post(
  "/paymentrequest",
  controller.createPaymongoPaymentRequest
);
checkoutSessionRouter.get("/:id", controller.getCheckoutSession);

export default checkoutSessionRouter;
