"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const ValidationError_1 = require("../../config/ValidationError");
const validation_1 = require("./validation");
const clientUserLoginService = async (body) => {
    const parsed = validation_1.clientUserLoginSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    const email = parsed.data.email;
    const provider = parsed.data.provider;
    const clientUser = await model_1.default.findOne({
        email,
        provider,
    });
    return clientUser;
};
const getClientUserService = async (email) => {
    const parsed = validation_1.getClientUserSchema.safeParse(email);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    const parsedEmail = parsed.data;
    const clientUser = await model_1.default.findOne({
        email: parsedEmail,
    }).populate("orders", {
        referenceNumber: 1,
        orderStatus: 1,
        itemsOrdered: 1,
        totalClientPaid: 1,
    });
    return clientUser;
};
const signupClientUserService = async (body) => {
    const parsed = validation_1.SignUpFormSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    const parsedData = parsed.data;
    const newClientUser = await model_1.default.create(parsedData);
    return newClientUser;
};
const updateClientUserService = async (body) => {
    const parsed = validation_1.UpadateClientUserSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    const parsedData = parsed.data;
    const id = parsedData.id;
    const updatedClientUser = await model_1.default.findByIdAndUpdate(id, {
        firstName: parsedData.firstName,
        lastName: parsedData.lastName,
        email: parsedData.email,
        phoneNumber: parsedData.phoneNumber,
        address: parsedData.address,
        city: parsedData.city,
    });
    return updatedClientUser;
};
const getClientUsersService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [clientUsers, total] = await Promise.all([
        model_1.default.find({}).skip(skip).limit(limit),
        model_1.default.countDocuments(),
    ]);
    return {
        clientUsers,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getRecentClientUsersService = async () => {
    const recentClientUsers = await model_1.default.find().sort({ _id: -1 }).limit(3);
    return recentClientUsers;
};
exports.default = {
    signupClientUserService,
    clientUserLoginService,
    getClientUserService,
    updateClientUserService,
    getClientUsersService,
    getRecentClientUsersService,
};
