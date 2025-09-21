import express from "express";
import controller from "./controller";
import authenticateToken from "../../middlewares/authenticateToken";

const StoreSettingsRouter = express.Router();

StoreSettingsRouter.post("/", authenticateToken, controller.addStoreSettings);
StoreSettingsRouter.get("/:id", controller.getStoreSettings);
StoreSettingsRouter.put(
  "/:id",
  authenticateToken,
  controller.updateStoreSettings
);

export default StoreSettingsRouter;
