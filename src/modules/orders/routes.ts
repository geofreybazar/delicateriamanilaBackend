import express from "express";
import authenticateToken from "../../middlewares/authenticateToken";
import controller from "./controller";

const OrdersRouter = express.Router();

OrdersRouter.get("/", authenticateToken, controller.getOrders);
OrdersRouter.get(
  "/acceptedorders",
  authenticateToken,
  controller.getAcceptedOrders
);
OrdersRouter.get(
  "/pendingorders",
  authenticateToken,
  controller.getPendingOrders
);
OrdersRouter.get(
  "/completedorders",
  authenticateToken,
  controller.getCompletedOrders
);
OrdersRouter.get(
  "/ordersfordelivery",
  authenticateToken,
  controller.getForDeliveryOrders
);
OrdersRouter.get(
  "/ordersongoingdelivery",
  authenticateToken,
  controller.getOngoingDeliveryOrders
);
OrdersRouter.get(
  "/forpickuporders",
  authenticateToken,
  controller.getForPickupOrders
);
OrdersRouter.get(
  "/gettotalnumberorders",
  authenticateToken,
  controller.getTotalNumberOrders
);
OrdersRouter.get(
  "/getriderpendingdeliveries",
  authenticateToken,
  controller.getRiderPendingDeliveries
);
OrdersRouter.get(
  "/riderdeliveredorders",
  authenticateToken,
  controller.getRiderDeliveredOrders
);
OrdersRouter.get(
  "/getrecentorders",
  authenticateToken,
  controller.getRecentOrders
);
OrdersRouter.get("/:id", controller.getOrder);
OrdersRouter.patch(
  "/ordersfordelivery/:id",
  authenticateToken,
  controller.outForDelivery
);
OrdersRouter.patch(
  "/assigndeliveryrider",
  authenticateToken,
  controller.assignDeliveryRider
);
OrdersRouter.patch(
  "/orderpickedup",
  authenticateToken,
  controller.orderPickedup
);
OrdersRouter.patch(
  "/readyforpickup/:id",
  authenticateToken,
  controller.readyForPickup
);
OrdersRouter.patch(
  "/orderdelivered/:id",
  authenticateToken,
  controller.orderDelivered
);
OrdersRouter.patch("/:id", authenticateToken, controller.acceptOrder);

export default OrdersRouter;
