"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_1 = require("./validation");
const config_1 = __importDefault(require("../../config/config"));
const createAdminUserService = async (body, defaultPassword) => {
    if (!body || !validation_1.userSchema.safeParse(body).success) {
        const error = new Error("Invalid user data");
        error.name = "ValidationError";
        error.status = 500;
        throw error;
    }
    const saltRound = 10;
    const passwordhash = await bcrypt_1.default.hash(defaultPassword, saltRound);
    const newAdminuser = await model_1.default.create({
        firstname: body.firstname,
        lastname: body.lastname,
        middlename: body.middlename,
        email: body.email,
        passwordhash,
        phoneNumber: body.phoneNumber,
    });
    return newAdminuser;
};
const loginService = async (body) => {
    if (!body || !validation_1.loginSchema.safeParse(body).success) {
        const error = new Error("Invalid username or password");
        error.name = "ValidationError";
        error.status = 500;
        throw error;
    }
    const { email, password } = body;
    const user = await model_1.default.findOne({ email: email });
    const passwordCorrect = user === null ? false : await bcrypt_1.default.compare(password, user.passwordhash);
    if (!user || !passwordCorrect) {
        const error = new Error("Invalid username or password");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
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
const getUserService = async (id) => {
    if (!id || !validation_1.getUserSchema.safeParse({ id }).success) {
        const error = new Error("Invalid user ID");
        error.name = "ValidationError";
        error.status = 500;
        throw error;
    }
    const user = await model_1.default.findById(id).select("-passwordhash -__v -refreshtokens");
    return user;
};
const removeRefreshToken = async (body) => {
    if (!body || !validation_1.logoutSchema.safeParse(body).success) {
        const error = new Error("Invalid login data");
        error.name = "ValidationError";
        error.status = 500;
        throw error;
    }
    const { id, refreshToken } = body;
    const user = await model_1.default.findById(id);
    if (!user) {
        const error = new Error("User not found!");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    user.refreshtokens = user.refreshtokens.filter((token) => token !== refreshToken);
    await user.save();
};
const updateUserInfoService = async (id, body) => {
    if (!body ||
        !validation_1.updateUserSchema.safeParse(body).success ||
        !id ||
        !validation_1.getUserSchema.safeParse({ id }).success) {
        const error = new Error("Invalid user data");
        error.name = "ValidationError";
        error.status = 500;
        throw error;
    }
    const updatedUser = await model_1.default.findByIdAndUpdate(id, body);
    return updatedUser;
};
const generateRefreshTokenService = async (refreshToken) => {
    if (!refreshToken) {
        const error = new Error("Refresh token not found, Login again");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const decodedToken = jsonwebtoken_1.default.verify(refreshToken, config_1.default.REFRESH_SECRET);
    if (typeof decodedToken === "string") {
        const error = new Error("Invalid token payload");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const user = await model_1.default.findById(decodedToken.id);
    if (!user || !user.refreshtokens.includes(refreshToken)) {
        const error = new Error("Refresh token is not valid");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    user.refreshtokens = user.refreshtokens.filter((token) => token !== refreshToken);
    const userToken = {
        email: user.email,
        id: user._id,
    };
    const newAccessToken = jsonwebtoken_1.default.sign(userToken, config_1.default.JWT_SECRET, {
        expiresIn: "15m",
    });
    const newRefreshToken = jsonwebtoken_1.default.sign(userToken, config_1.default.REFRESH_SECRET, {
        expiresIn: "7d",
    });
    user.refreshtokens.push(newRefreshToken);
    await user.save();
    return { newAccessToken, newRefreshToken };
};
const changePasswordService = async (id, body) => {
    if (!body || !validation_1.changePasswordSchema.safeParse(body).success) {
        const error = new Error("Invalid login data");
        error.name = "ValidationError";
        error.status = 500;
        throw error;
    }
    const { currentPassword, newPassword, confirmPassword } = body;
    if (confirmPassword !== newPassword) {
        const error = new Error("Password not match!");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const user = await model_1.default.findById(id);
    if (!user) {
        const error = new Error("User not found!");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const passwordCorrect = user === null
        ? false
        : await bcrypt_1.default.compare(currentPassword, user.passwordhash);
    if (!passwordCorrect) {
        const error = new Error("Wrong Current Password!");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const saltRound = 10;
    const newPasswordhash = await bcrypt_1.default.hash(newPassword, saltRound);
    user.passwordhash = newPasswordhash;
    user.save();
};
exports.default = {
    createAdminUserService,
    loginService,
    getUserService,
    removeRefreshToken,
    updateUserInfoService,
    generateRefreshTokenService,
    changePasswordService,
};
