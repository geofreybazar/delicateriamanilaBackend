"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config/config"));
const validation_1 = require("./validation");
const ValidationError_1 = require("../../config/ValidationError");
const AuthenticationError_1 = require("../../config/AuthenticationError");
const model_2 = __importDefault(require("../orders/model"));
const model_3 = __importDefault(require("../products/model"));
const model_4 = __importDefault(require("../clientUsers/model"));
const model_5 = __importDefault(require("../webhook/model"));
const createAdminUserService = async (body) => {
    if (!body || !validation_1.userSchema.safeParse(body).success) {
        throw new ValidationError_1.ValidationError("Invalid user data");
    }
    const defaultPassword = config_1.default.DEFAULT_PASSWORD;
    const saltRound = 10;
    const passwordhash = await bcrypt_1.default.hash(defaultPassword, saltRound);
    const newAdminuser = await model_1.default.create({
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
const loginService = async (body) => {
    if (!body || !validation_1.loginSchema.safeParse(body).success) {
        throw new ValidationError_1.ValidationError("Invalid username or password");
    }
    const { email, password } = body;
    const user = await model_1.default.findOne({ email: email });
    const passwordCorrect = user === null ? false : await bcrypt_1.default.compare(password, user.passwordhash);
    if (!user || !passwordCorrect) {
        throw new AuthenticationError_1.AuthenticationError("Invalid username or password");
    }
    if (user.status === "deactivated") {
        throw new AuthenticationError_1.AuthenticationError("Your account is deactivated. Please contact the store owner or system administrator if you believe this is a mistake.");
    }
    const userForToken = {
        email: user.email,
        id: user.id,
    };
    const accessToken = jsonwebtoken_1.default.sign(userForToken, config_1.default.JWT_SECRET, {
        expiresIn: "15m",
    });
    const refreshToken = jsonwebtoken_1.default.sign(userForToken, config_1.default.REFRESH_SECRET, {
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
const getLoggedInUserService = async (id) => {
    if (!id || !validation_1.getUserSchema.safeParse({ id }).success) {
        throw new ValidationError_1.ValidationError("Invalid user ID");
    }
    const user = await model_1.default.findById(id).select("-passwordhash -__v -refreshtokens");
    return user;
};
const removeRefreshToken = async (body) => {
    if (!body || !validation_1.logoutSchema.safeParse(body).success) {
        throw new ValidationError_1.ValidationError("Invalid login data");
    }
    const { id, refreshToken } = body;
    const user = await model_1.default.findById(id);
    if (!user) {
        throw new AuthenticationError_1.AuthenticationError("User not found!");
    }
    user.refreshtokens = user.refreshtokens.filter((token) => token !== refreshToken);
    await user.save();
};
const updateUserInfoService = async (id, body) => {
    if (!body ||
        !validation_1.updateUserSchema.safeParse(body).success ||
        !id ||
        !validation_1.getUserSchema.safeParse({ id }).success) {
        throw new ValidationError_1.ValidationError("Invalid user data");
    }
    const updatedUser = await model_1.default.findByIdAndUpdate(id, body);
    return updatedUser;
};
const generateRefreshTokenService = async (refreshToken) => {
    if (!refreshToken) {
        throw new AuthenticationError_1.AuthenticationError("Refresh token not found, Login again");
    }
    const decodedToken = jsonwebtoken_1.default.verify(refreshToken, config_1.default.REFRESH_SECRET);
    if (typeof decodedToken === "string") {
        throw new AuthenticationError_1.AuthenticationError("Invalid token payload");
    }
    const user = await model_1.default.findById(decodedToken.id);
    console.log(refreshToken);
    console.log(!user);
    console.log(!user?.refreshtokens.includes(refreshToken));
    if (!user || !user.refreshtokens.includes(refreshToken)) {
        throw new AuthenticationError_1.AuthenticationError("Refresh token is not valid");
    }
    user.refreshtokens = user.refreshtokens.filter((token) => token !== refreshToken);
    const userToken = {
        email: user.email,
        id: user.id,
    };
    const newAccessToken = jsonwebtoken_1.default.sign(userToken, config_1.default.JWT_SECRET, {
        expiresIn: "15m",
    });
    const newRefreshToken = jsonwebtoken_1.default.sign(userToken, config_1.default.REFRESH_SECRET, {
        expiresIn: "7d",
    });
    await model_1.default.findByIdAndUpdate(user.id, {
        $pull: { refreshtokens: refreshToken },
    });
    await model_1.default.findByIdAndUpdate(user.id, {
        $push: { refreshtokens: newRefreshToken },
    });
    return { newAccessToken, newRefreshToken };
};
const changePasswordService = async (id, body) => {
    if (!body || !validation_1.changePasswordSchema.safeParse(body).success) {
        throw new ValidationError_1.ValidationError("Invalid login data");
    }
    const { currentPassword, newPassword, confirmPassword } = body;
    if (confirmPassword !== newPassword) {
        throw new AuthenticationError_1.AuthenticationError("Password not match!");
    }
    const user = await model_1.default.findById(id);
    if (!user) {
        throw new AuthenticationError_1.AuthenticationError("User not found!");
    }
    const passwordCorrect = user === null
        ? false
        : await bcrypt_1.default.compare(currentPassword, user.passwordhash);
    if (!passwordCorrect) {
        throw new AuthenticationError_1.AuthenticationError("Wrong Current Password!");
    }
    const saltRound = 10;
    const newPasswordhash = await bcrypt_1.default.hash(newPassword, saltRound);
    user.passwordhash = newPasswordhash;
    await user.save();
};
const getAllAdminUsersService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [adminUsers, total] = await Promise.all([
        model_1.default.find({}).skip(skip).limit(limit),
        model_1.default.countDocuments(),
    ]);
    return {
        adminUsers,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getDeliveryRidersService = async () => {
    const deliveryRiders = await model_1.default.find({ role: "rider" });
    return deliveryRiders;
};
const getUserService = async (id) => {
    if (!id || !validation_1.getUserSchema.safeParse({ id }).success) {
        throw new ValidationError_1.ValidationError("Invalid user ID");
    }
    const user = await model_1.default.findById(id).select("-passwordhash -__v -refreshtokens");
    return user;
};
const resetAdminUserPasswordService = async (id) => {
    const parsedData = validation_1.getUserSchema.safeParse({ id });
    if (!parsedData.success) {
        throw new ValidationError_1.ValidationError("Invalid user ID");
    }
    const parsedId = parsedData.data.id;
    const defaultPassword = config_1.default.DEFAULT_PASSWORD;
    const user = await model_1.default.findById(parsedId);
    if (!user) {
        throw new AuthenticationError_1.AuthenticationError("User not found!");
    }
    const saltRound = 10;
    const defaultPasswordHash = await bcrypt_1.default.hash(defaultPassword, saltRound);
    user.passwordhash = defaultPasswordHash;
    await user.save();
    return { message: "Password reset successfully" };
};
const deactivateAdminUserService = async (id) => {
    const parsedData = validation_1.getUserSchema.safeParse({ id });
    if (!parsedData.success) {
        throw new ValidationError_1.ValidationError("Invalid user ID");
    }
    const parsedId = parsedData.data.id;
    const user = await model_1.default.findByIdAndUpdate(parsedId, {
        status: "deactivated",
    });
    if (!user) {
        throw new AuthenticationError_1.AuthenticationError("User not found!");
    }
    return;
};
const updateAdminUserService = async (id, body) => {
    if (!body ||
        !validation_1.userSchema.safeParse(body).success ||
        !id ||
        !validation_1.getUserSchema.safeParse({ id }).success) {
        throw new ValidationError_1.ValidationError("Invalid user data");
    }
    const updatedUser = await model_1.default.findByIdAndUpdate(id, body);
    return updatedUser;
};
const getDashboardSummaryService = async () => {
    const totalOrders = await model_2.default.countDocuments();
    const totalProducts = await model_3.default.countDocuments();
    const totalClientCustomers = await model_4.default.countDocuments();
    const totalNet = await model_5.default.aggregate([
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
const activateAdminUserSerice = async (id) => {
    const parsedData = validation_1.getUserSchema.safeParse({ id });
    if (!parsedData.success) {
        throw new ValidationError_1.ValidationError("Invalid user ID");
    }
    const parsedId = parsedData.data.id;
    const user = await model_1.default.findByIdAndUpdate(parsedId, {
        status: "active",
    });
    if (!user) {
        throw new AuthenticationError_1.AuthenticationError("User not found!");
    }
    return;
};
exports.default = {
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
