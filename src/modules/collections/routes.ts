import { Router } from "express";
import controller from "./controller";
import authenticateToken from "../../middlewares/authenticateToken";

const CollectionsRouter = Router();

CollectionsRouter.post("/", authenticateToken, controller.addCollection);
CollectionsRouter.get("/", authenticateToken, controller.getCollections);
CollectionsRouter.get("/allcollections", controller.getAllColletions);
CollectionsRouter.get("/getcollectioname/:id", controller.getCollectionsName);
CollectionsRouter.get("/:id", authenticateToken, controller.getCollection);
CollectionsRouter.put("/:id", controller.updateCollection);
CollectionsRouter.delete("/", controller.deleteCollection);

export default CollectionsRouter;
