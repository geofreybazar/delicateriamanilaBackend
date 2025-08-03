import express from "express";
import controller from "./controller";

const WebhookRouter = express.Router();

WebhookRouter.post("/paymongowebhook", controller.acceptWebhookEndpoint);

export default WebhookRouter;
