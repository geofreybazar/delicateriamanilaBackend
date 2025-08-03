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
const createAdminUserService = async (body, defaultPassword) => {
    if (!body || !validation_1.userSchema.safeParse(body).success) {
        throw new ValidationError_1.ValidationError("Invalid user data");
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
        throw new ValidationError_1.ValidationError("Invalid username or password");
    }
    const { email, password } = body;
    const user = await model_1.default.findOne({ email: email });
    const passwordCorrect = user === null ? false : await bcrypt_1.default.compare(password, user.passwordhash);
    if (!user || !passwordCorrect) {
        throw new AuthenticationError_1.AuthenticationError("Invalid username or password");
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
    if (!user || !user.refreshtokens.includes(refreshToken)) {
        throw new AuthenticationError_1.AuthenticationError("Refresh token is not valid");
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
    await model_1.default.findByIdAndUpdate(user._id, {
        $pull: { refreshtokens: refreshToken },
    });
    await model_1.default.findByIdAndUpdate(user._id, {
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
