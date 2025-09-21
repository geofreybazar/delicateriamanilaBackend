import { Router } from "express";
import controller from "./controller";
import authenticateToken from "../../middlewares/authenticateToken";

const ProductsRouter = Router();

ProductsRouter.post("/", authenticateToken, controller.addProduct);
ProductsRouter.get("/", controller.getProducts);
ProductsRouter.get("/getshopproducts", controller.getShopProducts);
ProductsRouter.get("/getfeaturedproducts", controller.getFeaturedProducts);
ProductsRouter.get(
  "/getshopfeaturedproducts",
  controller.getShopFeaturedProducts
);
ProductsRouter.get("/:id", authenticateToken, controller.getProduct);
ProductsRouter.put(
  "/incrementproductquantity/:id",
  authenticateToken,
  controller.incrementProductQuantitybyOne
);
ProductsRouter.put(
  "/decrementproductquantity/:id",
  authenticateToken,
  controller.decrementProductQuantitybyOne
);
ProductsRouter.put("/:id", authenticateToken, controller.updateProduct);
ProductsRouter.delete("/", controller.deleteProducts);

export default ProductsRouter;
