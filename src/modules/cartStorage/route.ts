import express from "express";
import controller from "./controller";

const CartStorageRouter = express.Router();

CartStorageRouter.post(
  "/createclientusercart",
  controller.createClientUserCart
);
CartStorageRouter.post("/:id", controller.createCart);
CartStorageRouter.get("/:id", controller.getCart);
CartStorageRouter.put("/additemtocart", controller.addItem);
CartStorageRouter.put("/addquantity", controller.addQuantity);
CartStorageRouter.put("/minusquantity", controller.minusQuantity);
CartStorageRouter.delete("/removeitem", controller.removeItem);

export default CartStorageRouter;
