import AdminUser from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config/config";
import { AppError } from "../../middlewares/errorHandler";
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
import { ValidationError } from "../../config/ValidationError";
import { AuthenticationError } from "../../config/AuthenticationError";

const createAdminUserService = async (
  body: UserType,
  defaultPassword: string
) => {
  if (!body || !userSchema.safeParse(body).success) {
    throw new ValidationError("Invalid user data");
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
    throw new ValidationError("Invalid username or password");
  }

  const { email, password } = body;

  const user = await AdminUser.findOne({ email: email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordhash);

  if (!user || !passwordCorrect) {
    throw new AuthenticationError("Invalid username or password");
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
    throw new ValidationError("Invalid user ID");
  }

  const user = await AdminUser.findById(id).select(
    "-passwordhash -__v -refreshtokens"
  );
  return user;
};

const removeRefreshToken = async (body: LogoutType) => {
  if (!body || !logoutSchema.safeParse(body).success) {
    throw new ValidationError("Invalid login data");
  }

  const { id, refreshToken } = body;

  const user = await AdminUser.findById(id);
  if (!user) {
    throw new AuthenticationError("User not found!");
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
    throw new ValidationError("Invalid user data");
  }

  const updatedUser = await AdminUser.findByIdAndUpdate(id, body);
  return updatedUser;
};

const generateRefreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AuthenticationError("Refresh token not found, Login again");
  }

  const decodedToken = jwt.verify(refreshToken, config.REFRESH_SECRET);

  if (typeof decodedToken === "string") {
    throw new AuthenticationError("Invalid token payload");
  }

  const user = await AdminUser.findById(decodedToken.id);

  if (!user || !user.refreshtokens.includes(refreshToken)) {
    throw new AuthenticationError("Refresh token is not valid");
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

  await AdminUser.findByIdAndUpdate(user._id, {
    $pull: { refreshtokens: refreshToken },
  });

  await AdminUser.findByIdAndUpdate(user._id, {
    $push: { refreshtokens: newRefreshToken },
  });

  return { newAccessToken, newRefreshToken };
};

const changePasswordService = async (id: string, body: ChangePasswordType) => {
  if (!body || !changePasswordSchema.safeParse(body).success) {
    throw new ValidationError("Invalid login data");
  }
  const { currentPassword, newPassword, confirmPassword } = body;

  if (confirmPassword !== newPassword) {
    throw new AuthenticationError("Password not match!");
  }

  const user = await AdminUser.findById(id);
  if (!user) {
    throw new AuthenticationError("User not found!");
  }

  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(currentPassword, user.passwordhash);

  if (!passwordCorrect) {
    throw new AuthenticationError("Wrong Current Password!");
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
