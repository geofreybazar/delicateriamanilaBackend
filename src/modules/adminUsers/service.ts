import AdminUser from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config/config";
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
import Orders from "../orders/model";
import Products from "../products/model";
import ClientUser from "../clientUsers/model";
import Webhook from "../webhook/model";

const createAdminUserService = async (body: UserType) => {
  if (!body || !userSchema.safeParse(body).success) {
    throw new ValidationError("Invalid user data");
  }
  const defaultPassword = config.DEFAULT_PASSWORD;
  const saltRound = 10;
  const passwordhash = await bcrypt.hash(defaultPassword, saltRound);

  const newAdminuser = await AdminUser.create({
    firstname: body.firstname,
    lastname: body.lastname,
    middlename: body.middlename,
    email: body.email,
    passwordhash,
    phoneNumber: body.phoneNumber,
    role: body.role,
    status: "active",
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

  if (user.status === "deactivated") {
    throw new AuthenticationError(
      "Your account is deactivated. Please contact the store owner or system administrator if you believe this is a mistake."
    );
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

const getLoggedInUserService = async (id: string) => {
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
  console.log(refreshToken);
  console.log(!user);
  console.log(!user?.refreshtokens.includes(refreshToken));
  if (!user || !user.refreshtokens.includes(refreshToken)) {
    throw new AuthenticationError("Refresh token is not valid");
  }

  user.refreshtokens = user.refreshtokens.filter(
    (token) => token !== refreshToken
  );

  const userToken = {
    email: user.email,
    id: user.id,
  };
  const newAccessToken = jwt.sign(userToken, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign(userToken, config.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  await AdminUser.findByIdAndUpdate(user.id, {
    $pull: { refreshtokens: refreshToken },
  });

  await AdminUser.findByIdAndUpdate(user.id, {
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
  await user.save();
};

const getAllAdminUsersService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [adminUsers, total] = await Promise.all([
    AdminUser.find({}).skip(skip).limit(limit),
    AdminUser.countDocuments(),
  ]);

  return {
    adminUsers,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getDeliveryRidersService = async () => {
  const deliveryRiders = await AdminUser.find({ role: "rider" });

  return deliveryRiders;
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

const resetAdminUserPasswordService = async (id: string) => {
  const parsedData = getUserSchema.safeParse({ id });
  if (!parsedData.success) {
    throw new ValidationError("Invalid user ID");
  }

  const parsedId = parsedData.data.id;
  const defaultPassword = config.DEFAULT_PASSWORD;

  const user = await AdminUser.findById(parsedId);
  if (!user) {
    throw new AuthenticationError("User not found!");
  }

  const saltRound = 10;
  const defaultPasswordHash = await bcrypt.hash(defaultPassword, saltRound);
  user.passwordhash = defaultPasswordHash;
  await user.save();

  return { message: "Password reset successfully" };
};

const deactivateAdminUserService = async (id: string) => {
  const parsedData = getUserSchema.safeParse({ id });
  if (!parsedData.success) {
    throw new ValidationError("Invalid user ID");
  }

  const parsedId = parsedData.data.id;
  const user = await AdminUser.findByIdAndUpdate(parsedId, {
    status: "deactivated",
  });

  if (!user) {
    throw new AuthenticationError("User not found!");
  }

  return;
};

const updateAdminUserService = async (id: string, body: UserType) => {
  if (
    !body ||
    !userSchema.safeParse(body).success ||
    !id ||
    !getUserSchema.safeParse({ id }).success
  ) {
    throw new ValidationError("Invalid user data");
  }

  const updatedUser = await AdminUser.findByIdAndUpdate(id, body);
  return updatedUser;
};

const getDashboardSummaryService = async () => {
  const totalOrders = await Orders.countDocuments();
  const totalProducts = await Products.countDocuments();
  const totalClientCustomers = await ClientUser.countDocuments();
  const totalNet = await Webhook.aggregate([
    { $match: { type: "checkout_session.payment.paid" } },
    { $unwind: "$data.data.attributes.data.attributes.payments" },
    {
      $group: {
        _id: null,
        totalNetAmount: {
          $sum: "$data.data.attributes.data.attributes.payments.attributes.net_amount",
        },
      },
    },
  ]);
  console.log(totalNet);
  const totalCounts = {
    totalOrders,
    totalProducts,
    totalClientCustomers,
    totalNet,
  };

  return totalCounts;
};

const activateAdminUserSerice = async (id: string) => {
  const parsedData = getUserSchema.safeParse({ id });
  if (!parsedData.success) {
    throw new ValidationError("Invalid user ID");
  }

  const parsedId = parsedData.data.id;
  const user = await AdminUser.findByIdAndUpdate(parsedId, {
    status: "active",
  });

  if (!user) {
    throw new AuthenticationError("User not found!");
  }

  return;
};

export default {
  createAdminUserService,
  loginService,
  getLoggedInUserService,
  removeRefreshToken,
  updateUserInfoService,
  generateRefreshTokenService,
  changePasswordService,
  getAllAdminUsersService,
  getDeliveryRidersService,
  getUserService,
  resetAdminUserPasswordService,
  deactivateAdminUserService,
  updateAdminUserService,
  getDashboardSummaryService,
  activateAdminUserSerice,
};
