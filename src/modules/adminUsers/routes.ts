import { Router } from "express";
import controller from "./controller";
import authenticateToken from "../../middlewares/authenticateToken";

const AdminUserRouter = Router();

AdminUserRouter.post("/", authenticateToken, controller.createAdminUser);
AdminUserRouter.post("/login", controller.login);
AdminUserRouter.post("/logout", authenticateToken, controller.logout);
AdminUserRouter.post("/refreshtoken", controller.generateRefreshToken);
AdminUserRouter.get("/", authenticateToken, controller.getLoggedInUser);
AdminUserRouter.get(
  "/getalladminusers",
  authenticateToken,
  controller.getAllAdminUsers
);
AdminUserRouter.get(
  "/deliveryriders",
  authenticateToken,
  controller.getDeliveryRiders
);
AdminUserRouter.get(
  "/getDashboardSummary",
  authenticateToken,
  controller.getDashboardSummary
);
AdminUserRouter.get("/getuser/:id", authenticateToken, controller.getUser);
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
AdminUserRouter.put(
  "/resetadminuserpassword/:id",
  authenticateToken,
  controller.resetAdminUserPassword
);
AdminUserRouter.put(
  "/deactivateadminuser/:id",
  authenticateToken,
  controller.deactivateAdminUser
);
AdminUserRouter.put(
  "/activateadminuser/:id",
  authenticateToken,
  controller.activateAdminUser
);
AdminUserRouter.put(
  "/updateadminuser/:id",
  authenticateToken,
  controller.updateAdminUser
);

export default AdminUserRouter;
