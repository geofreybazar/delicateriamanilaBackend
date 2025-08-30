import { Request, Response, NextFunction } from "express";
import service from "./service";
import type { RequestWithUser } from "../../middlewares/authenticateToken";

const createAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;

  try {
    const newAdminuser = await service.createAdminUserService(body);
    res.status(200).json(newAdminuser);
    return;
  } catch (error) {
    next(error);
  }
};

const updateUserInfo = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    const error: any = new Error("You are not authenticated");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }
  const id = req.user.id;
  const body = req.body;

  try {
    const updatedUser = await service.updateUserInfoService(id, body);
    res.status(201).json(updatedUser);
    return;
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;

  try {
    const { id, accessToken, refreshToken } = await service.loginService(body);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      id: id,
    });
    return;
  } catch (error) {
    next(error);
  }
};

const generateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("refreshing");
  const refreshToken = req.cookies.refresh_token;

  try {
    const { newAccessToken, newRefreshToken } =
      await service.generateRefreshTokenService(refreshToken);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed" });
    return;
  } catch (error: any) {
    next(error);
  }
};

const logout = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    const error: any = new Error("You are not authenticated");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }
  const id = req.user.id;
  const refreshToken = req.cookies.refresh_token;

  const body = { id, refreshToken };

  try {
    await service.removeRefreshToken(body);

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const getLoggedInUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    const error: any = new Error("You are not authenticated");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  const id = req.user.id;

  try {
    const user = await service.getLoggedInUserService(id);
    res.status(200).json(user);
    return;
  } catch (error) {
    next(error);
  }
};

const changePassword = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || typeof req.user === "string") {
    const error: any = new Error("You are not authenticated");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  const id = req.user?.id;
  const body = req.body;

  try {
    await service.changePasswordService(id, body);
    res.status(201).json({ message: "succesfully change password" });
  } catch (error) {
    next(error);
  }
};

const getAllAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const adminUsers = await service.getAllAdminUsersService(page, limit);
    res.status(201).json(adminUsers);
    return;
  } catch (error) {
    next(error);
  }
};

const getDeliveryRiders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deliveryRiders = await service.getDeliveryRidersService();
    res.status(201).json(deliveryRiders);
    return;
  } catch (error) {
    next(error);
  }
};

const getUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  try {
    const user = await service.getUserService(id);
    res.status(200).json(user);
    return;
  } catch (error) {
    next(error);
  }
};

const resetAdminUserPassword = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    await service.resetAdminUserPasswordService(id);
    res.status(200).json({ message: "Password reset successfully" });
    return;
  } catch (error) {
    next(error);
  }
};

const deactivateAdminUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    await service.deactivateAdminUserService(id);
    res.status(200).json({ message: "User was deactivated" });
    return;
  } catch (error) {
    next(error);
  }
};

const activateAdminUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    await service.activateAdminUserSerice(id);
    res.status(200).json({ message: "User was activated" });
    return;
  } catch (error) {
    next(error);
  }
};

const updateAdminUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const body = req.body;
  try {
    await service.updateAdminUserService(id, body);
    res.status(200).json({ message: "User was updated" });
    return;
  } catch (error) {
    next(error);
  }
};

const getDashboardSummary = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const totalCount = await service.getDashboardSummaryService();
    res.status(200).json(totalCount);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  createAdminUser,
  login,
  getLoggedInUser,
  logout,
  updateUserInfo,
  changePassword,
  generateRefreshToken,
  getAllAdminUsers,
  getDeliveryRiders,
  getUser,
  resetAdminUserPassword,
  deactivateAdminUser,
  updateAdminUser,
  getDashboardSummary,
  activateAdminUser,
};
