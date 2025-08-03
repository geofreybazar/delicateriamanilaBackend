import { Router } from "express";
import controller from "./controller";
import authenticateToken from "../../middlewares/authenticateToken";

const AdminUserRouter = Router();

AdminUserRouter.post("/", authenticateToken, controller.createAdminUser);
AdminUserRouter.post("/login", controller.login);
AdminUserRouter.post("/logout", authenticateToken, controller.logout);
AdminUserRouter.post("/refreshtoken", controller.generateRefreshToken);
AdminUserRouter.get("/", authenticateToken, controller.getLoggedInUser);
AdminUserRouter.put(
  "/upadateuser",
  authenticateToken,
  controller.updateUserInfo
);
AdminUserRouter.put(
  "/changepassword",
  authenticateToken,
  controller.changePassword
);

export default AdminUserRouter;
