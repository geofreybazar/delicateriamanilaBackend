"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const clientUserLogin = async (req, res, next) => {
    const { email, provider } = req.body;
    try {
        const clientUser = await service_1.default.clientUserLoginService({
            email,
            provider,
        });
        res.status(200).json(clientUser);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getClientUser = async (req, res, next) => {
    const email = req.params.email;
    console.log(email);
    try {
        const clientUser = await service_1.default.getClientUserService(email);
        res.status(200).json(clientUser);
        return;
    }
    catch (error) {
        next(error);
    }
};
const signupClientUser = async (req, res, next) => {
    const body = req.body;
    try {
        const newClientUser = await service_1.default.signupClientUserService(body);
        res.status(200).json(newClientUser);
        return;
    }
    catch (error) {
        next(error);
    }
};
const updateClientUser = async (req, res, next) => {
    const body = req.body;
    console.log(body);
    try {
        const updatedClientUser = await service_1.default.updateClientUserService(body);
        res.status(200).json(updatedClientUser);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getClientUsers = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const clientUsers = await service_1.default.getClientUsersService(page, limit);
        res.status(201).json(clientUsers);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getRecentClientUsers = async (req, res, next) => {
    try {
        const recentClientUsers = await service_1.default.getRecentClientUsersService();
        res.status(201).json(recentClientUsers);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    signupClientUser,
    clientUserLogin,
    getClientUser,
    updateClientUser,
    getClientUsers,
    getRecentClientUsers,
};
