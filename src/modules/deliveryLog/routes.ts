import express from "express";
import controller from "./controller";
import authenticateToken from "../../middlewares/authenticateToken";

const DeliveryLogsRouter = express.Router();

DeliveryLogsRouter.get("/:id", authenticateToken, controller.getDeliveryLogs);

export default DeliveryLogsRouter;
