"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const createAdminUser = async (req, res, next) => {
    const body = req.body;
    try {
        const newAdminuser = await service_1.default.createAdminUserService(body);
        res.status(200).json(newAdminuser);
        return;
    }
    catch (error) {
        next(error);
    }
};
const updateUserInfo = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        const error = new Error("You are not authenticated");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const id = req.user.id;
    const body = req.body;
    try {
        const updatedUser = await service_1.default.updateUserInfoService(id, body);
        res.status(201).json(updatedUser);
        return;
    }
    catch (error) {
        next(error);
    }
};
const login = async (req, res, next) => {
    const body = req.body;
    try {
        const { id, accessToken, refreshToken } = await service_1.default.loginService(body);
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
    }
    catch (error) {
        next(error);
    }
};
const generateRefreshToken = async (req, res, next) => {
    console.log("refreshing");
    const refreshToken = req.cookies.refresh_token;
    try {
        const { newAccessToken, newRefreshToken } = await service_1.default.generateRefreshTokenService(refreshToken);
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
    }
    catch (error) {
        next(error);
    }
};
const logout = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        const error = new Error("You are not authenticated");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const id = req.user.id;
    const refreshToken = req.cookies.refresh_token;
    const body = { id, refreshToken };
    try {
        await service_1.default.removeRefreshToken(body);
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
    }
    catch (error) {
        next(error);
    }
};
const getLoggedInUser = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        const error = new Error("You are not authenticated");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const id = req.user.id;
    try {
        const user = await service_1.default.getLoggedInUserService(id);
        res.status(200).json(user);
        return;
    }
    catch (error) {
        next(error);
    }
};
const changePassword = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        const error = new Error("You are not authenticated");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
    }
    const id = req.user?.id;
    const body = req.body;
    try {
        await service_1.default.changePasswordService(id, body);
        res.status(201).json({ message: "succesfully change password" });
    }
    catch (error) {
        next(error);
    }
};
const getAllAdminUsers = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const adminUsers = await service_1.default.getAllAdminUsersService(page, limit);
        res.status(201).json(adminUsers);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getDeliveryRiders = async (req, res, next) => {
    try {
        const deliveryRiders = await service_1.default.getDeliveryRidersService();
        res.status(201).json(deliveryRiders);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getUser = async (req, res, next) => {
    const id = req.params.id;
    try {
        const user = await service_1.default.getUserService(id);
        res.status(200).json(user);
        return;
    }
    catch (error) {
        next(error);
    }
};
const resetAdminUserPassword = async (req, res, next) => {
    const id = req.params.id;
    try {
        await service_1.default.resetAdminUserPasswordService(id);
        res.status(200).json({ message: "Password reset successfully" });
        return;
    }
    catch (error) {
        next(error);
    }
};
const deactivateAdminUser = async (req, res, next) => {
    const id = req.params.id;
    try {
        await service_1.default.deactivateAdminUserService(id);
        res.status(200).json({ message: "User was deactivated" });
        return;
    }
    catch (error) {
        next(error);
    }
};
const activateAdminUser = async (req, res, next) => {
    const id = req.params.id;
    try {
        await service_1.default.activateAdminUserSerice(id);
        res.status(200).json({ message: "User was activated" });
        return;
    }
    catch (error) {
        next(error);
    }
};
const updateAdminUser = async (req, res, next) => {
    const id = req.params.id;
    const body = req.body;
    try {
        await service_1.default.updateAdminUserService(id, body);
        res.status(200).json({ message: "User was updated" });
        return;
    }
    catch (error) {
        next(error);
    }
};
const getDashboardSummary = async (req, res, next) => {
    try {
        const totalCount = await service_1.default.getDashboardSummaryService();
        res.status(200).json(totalCount);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
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
