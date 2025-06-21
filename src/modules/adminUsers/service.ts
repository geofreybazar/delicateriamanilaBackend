import AdminUser from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  getUserSchema,
  updateUserSchema,
  userSchema,
  UserType,
  LoginType,
  LogoutType,
  loginSchema,
  logoutSchema,
  ChangePasswordType,
  changePasswordSchema,
} from "./validation";
import config from "../../config/config";
import { AppError } from "../../middlewares/errorHandler";

const createAdminUserService = async (
  body: UserType,
  defaultPassword: string
) => {
  if (!body || !userSchema.safeParse(body).success) {
    const error: any = new Error("Invalid user data");
    error.name = "ValidationError";
    error.status = 500;
    throw error;
  }
  const saltRound = 10;
  const passwordhash = await bcrypt.hash(defaultPassword, saltRound);

  const newAdminuser = await AdminUser.create({
    firstname: body.firstname,
    lastname: body.lastname,
    middlename: body.middlename,
    email: body.email,
    passwordhash,
    phoneNumber: body.phoneNumber,
  });

  return newAdminuser;
};

const loginService = async (body: LoginType) => {
  if (!body || !loginSchema.safeParse(body).success) {
    const error: any = new Error("Invalid username or password");
    error.name = "ValidationError";
    error.status = 500;
    throw error;
  }

  const { email, password } = body;

  const user = await AdminUser.findOne({ email: email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordhash);

  if (!user || !passwordCorrect) {
    const error: AppError = new Error("Invalid username or password");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  const userForToken = {
    email: user.email,
    id: user.id,
  };

  const accessToken = jwt.sign(userForToken, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(userForToken, config.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  user.refreshtokens = user.refreshtokens.concat(refreshToken);
  await user.save();

  return {
    id: user._id.toString(),
    accessToken,
    refreshToken,
  };
};

const getUserService = async (id: string) => {
  if (!id || !getUserSchema.safeParse({ id }).success) {
    const error: any = new Error("Invalid user ID");
    error.name = "ValidationError";
    error.status = 500;
    throw error;
  }

  const user = await AdminUser.findById(id).select(
    "-passwordhash -__v -refreshtokens"
  );
  return user;
};

const removeRefreshToken = async (body: LogoutType) => {
  if (!body || !logoutSchema.safeParse(body).success) {
    const error: any = new Error("Invalid login data");
    error.name = "ValidationError";
    error.status = 500;
    throw error;
  }
  const { id, refreshToken } = body;

  const user = await AdminUser.findById(id);
  if (!user) {
    const error: AppError = new Error("User not found!");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }
  user.refreshtokens = user.refreshtokens.filter(
    (token) => token !== refreshToken
  );
  await user.save();
};

const updateUserInfoService = async (
  id: string,
  body: Omit<UserType, "role">
) => {
  if (
    !body ||
    !updateUserSchema.safeParse(body).success ||
    !id ||
    !getUserSchema.safeParse({ id }).success
  ) {
    const error: any = new Error("Invalid user data");
    error.name = "ValidationError";
    error.status = 500;
    throw error;
  }

  const updatedUser = await AdminUser.findByIdAndUpdate(id, body);
  return updatedUser;
};

const generateRefreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    const error: AppError = new Error("Refresh token not found, Login again");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  const decodedToken = jwt.verify(refreshToken, config.REFRESH_SECRET);

  if (typeof decodedToken === "string") {
    const error: AppError = new Error("Invalid token payload");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  const user = await AdminUser.findById(decodedToken.id);

  if (!user || !user.refreshtokens.includes(refreshToken)) {
    const error: AppError = new Error("Refresh token is not valid");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  user.refreshtokens = user.refreshtokens.filter(
    (token) => token !== refreshToken
  );

  const userToken = {
    email: user.email,
    id: user._id,
  };
  const newAccessToken = jwt.sign(userToken, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign(userToken, config.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  user.refreshtokens.push(newRefreshToken);
  await user.save();

  return { newAccessToken, newRefreshToken };
};

const changePasswordService = async (id: string, body: ChangePasswordType) => {
  if (!body || !changePasswordSchema.safeParse(body).success) {
    const error: any = new Error("Invalid login data");
    error.name = "ValidationError";
    error.status = 500;
    throw error;
  }
  const { currentPassword, newPassword, confirmPassword } = body;

  if (confirmPassword !== newPassword) {
    const error: any = new Error("Password not match!");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  const user = await AdminUser.findById(id);
  if (!user) {
    const error: AppError = new Error("User not found!");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(currentPassword, user.passwordhash);

  if (!passwordCorrect) {
    const error: AppError = new Error("Wrong Current Password!");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  const saltRound = 10;
  const newPasswordhash = await bcrypt.hash(newPassword, saltRound);
  user.passwordhash = newPasswordhash;
  user.save();
};

export default {
  createAdminUserService,
  loginService,
  getUserService,
  removeRefreshToken,
  updateUserInfoService,
  generateRefreshTokenService,
  changePasswordService,
};
