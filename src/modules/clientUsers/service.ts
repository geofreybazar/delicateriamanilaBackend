import ClientUser from "./model";
import { ValidationError } from "../../config/ValidationError";

import {
  ClientUserLoginType,
  clientUserLoginSchema,
  getClientUserSchema,
  GetClientUserType,
  SignUpFormSchema,
  SignUpFormType,
  UpadateClientUserType,
  UpadateClientUserSchema,
} from "./validation";

const clientUserLoginService = async (body: ClientUserLoginType) => {
  const parsed = clientUserLoginSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Validation failed");
  }

  const email = parsed.data.email;
  const provider = parsed.data.provider;

  const clientUser = await ClientUser.findOne({
    email,
    provider,
  });

  return clientUser;
};

const getClientUserService = async (email: GetClientUserType) => {
  const parsed = getClientUserSchema.safeParse(email);
  if (!parsed.success) {
    throw new ValidationError("Validation failed");
  }

  const parsedEmail = parsed.data;

  const clientUser = await ClientUser.findOne({
    email: parsedEmail,
  }).populate("orders", {
    referenceNumber: 1,
    orderStatus: 1,
    itemsOrdered: 1,
    totalClientPaid: 1,
    createdAt: 1,
  });
  return clientUser;
};

const signupClientUserService = async (body: SignUpFormType) => {
  const parsed = SignUpFormSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Validation failed");
  }

  const parsedData = parsed.data;

  const newClientUser = await ClientUser.create(parsedData);

  return newClientUser;
};

const updateClientUserService = async (body: UpadateClientUserType) => {
  const parsed = UpadateClientUserSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Validation failed");
  }

  const parsedData = parsed.data;
  const id = parsedData.id;

  const updatedClientUser = await ClientUser.findByIdAndUpdate(id, {
    firstName: parsedData.firstName,
    lastName: parsedData.lastName,
    email: parsedData.email,
    phoneNumber: parsedData.phoneNumber,
    address: parsedData.address,
    city: parsedData.city,
  });

  return updatedClientUser;
};

const getClientUsersService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [clientUsers, total] = await Promise.all([
    ClientUser.find({}).skip(skip).limit(limit),
    ClientUser.countDocuments(),
  ]);

  return {
    clientUsers,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getRecentClientUsersService = async () => {
  const recentClientUsers = await ClientUser.find().sort({ _id: -1 }).limit(3);
  return recentClientUsers;
};

export default {
  signupClientUserService,
  clientUserLoginService,
  getClientUserService,
  updateClientUserService,
  getClientUsersService,
  getRecentClientUsersService,
};
