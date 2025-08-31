"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const createCart = async (req, res, next) => {
    const id = req.params.id;
    try {
        const newCart = await service_1.default.createCartService(id);
        res.status(201).json(newCart);
        return;
    }
    catch (error) {
        next(error);
    }
};
const createClientUserCart = async (req, res, next) => {
    const body = req.body;
    try {
        const clientUserCart = await service_1.default.createClientUserCartService(body);
        res.status(200).json(clientUserCart);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getCart = async (req, res, next) => {
    const id = req.params.id;
    try {
        const cart = await service_1.default.getCartService(id);
        res.status(200).json(cart);
        return;
    }
    catch (error) {
        next(error);
    }
};
const addItem = async (req, res, next) => {
    const body = req.body;
    try {
        const updatedCart = await service_1.default.addItemService(body);
        res.status(200).json(updatedCart);
        return;
    }
    catch (error) {
        next(error);
    }
};
const addQuantity = async (req, res, next) => {
    const body = req.body;
    try {
        const upatedCart = await service_1.default.addQuantiyService(body);
        res.status(200).json(upatedCart);
        return;
    }
    catch (error) {
        next(error);
    }
};
const minusQuantity = async (req, res, next) => {
    const body = req.body;
    try {
        const upatedCart = await service_1.default.minusQuantityService(body);
        res.status(200).json(upatedCart);
        return;
    }
    catch (error) {
        next(error);
    }
};
const removeItem = async (req, res, next) => {
    const body = req.body;
    try {
        const upatedCart = await service_1.default.removeItemService(body);
        res.status(200).json(upatedCart);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createCart,
    getCart,
    addItem,
    addQuantity,
    minusQuantity,
    removeItem,
    createClientUserCart,
};
