import express from "express";
import controller from "./controller";

const ClienUserRouter = express.Router();

ClienUserRouter.post("/signup", controller.signupClientUser);
ClienUserRouter.post("/login", controller.clientUserLogin);
ClienUserRouter.get("/", controller.getClientUsers);
ClienUserRouter.get("/getrecentclientusers", controller.getRecentClientUsers);
ClienUserRouter.get("/:email", controller.getClientUser);
ClienUserRouter.put("/updateclientuser", controller.updateClientUser);

export default ClienUserRouter;
