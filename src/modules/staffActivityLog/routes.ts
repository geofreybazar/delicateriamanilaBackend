import express from "express";
import controller from "./controller";
import authenticateToken from "../../middlewares/authenticateToken";

const StaffActivityRouter = express.Router();

StaffActivityRouter.get(
  "/getstaffactivitylogs",
  authenticateToken,
  controller.getStaffActivityLogs
);

export default StaffActivityRouter;
