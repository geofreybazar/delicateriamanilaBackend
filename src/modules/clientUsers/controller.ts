import { Request, Response, NextFunction } from "express";
import service from "./service";

const clientUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, provider } = req.body;

  try {
    const clientUser = await service.clientUserLoginService({
      email,
      provider,
    });
    res.status(200).json(clientUser);
    return;
  } catch (error) {
    next(error);
  }
};

const getClientUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.params.email;
  console.log(email);
  try {
    const clientUser = await service.getClientUserService(email);
    res.status(200).json(clientUser);
    return;
  } catch (error) {
    next(error);
  }
};

const signupClientUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  try {
    const newClientUser = await service.signupClientUserService(body);
    res.status(200).json(newClientUser);
    return;
  } catch (error) {
    next(error);
  }
};

const updateClientUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  console.log(body);
  try {
    const updatedClientUser = await service.updateClientUserService(body);
    res.status(200).json(updatedClientUser);
    return;
  } catch (error) {
    next(error);
  }
};

const getClientUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const clientUsers = await service.getClientUsersService(page, limit);
    res.status(201).json(clientUsers);
    return;
  } catch (error) {
    next(error);
  }
};

const getRecentClientUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recentClientUsers = await service.getRecentClientUsersService();
    res.status(201).json(recentClientUsers);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  signupClientUser,
  clientUserLogin,
  getClientUser,
  updateClientUser,
  getClientUsers,
  getRecentClientUsers,
};
