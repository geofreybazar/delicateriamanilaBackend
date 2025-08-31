"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthenticationError_1 = require("../../config/AuthenticationError");
const service_1 = __importDefault(require("./service"));
const getOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const orders = await service_1.default.getOrdersService(page, limit);
        res.status(200).json(orders);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getPendingOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const orders = await service_1.default.getPendingOrdersService(page, limit);
        res.status(200).json(orders);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getCompletedOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const orders = await service_1.default.getCompletedOrdersService(page, limit);
        res.status(200).json(orders);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getOrder = async (req, res, next) => {
    const id = req.params.id;
    try {
        const order = await service_1.default.getOrderService(id);
        res.status(200).json(order);
        return;
    }
    catch (error) {
        next(error);
    }
};
const acceptOrder = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        throw new AuthenticationError_1.AuthenticationError("You are not authenticated");
    }
    const userId = req.user.id;
    const id = req.params.id;
    try {
        const acceptedOrder = await service_1.default.acceptOrderService(id, userId);
        res.status(200).json(acceptedOrder);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getAcceptedOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const acceptedOrders = await service_1.default.getAcceptedOrderServices(page, limit);
        res.status(200).json(acceptedOrders);
        return;
    }
    catch (error) {
        next(error);
    }
};
const outForDelivery = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        throw new AuthenticationError_1.AuthenticationError("You are not authenticated");
    }
    const userId = req.user.id;
    const id = req.params.id;
    try {
        const orderForDelivery = await service_1.default.outForDeliveryService(id, userId);
        res.status(200).json(orderForDelivery);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getForDeliveryOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const orderForDelivery = await service_1.default.getForDeliveryOrdersServices(page, limit);
        res.status(200).json(orderForDelivery);
        return;
    }
    catch (error) {
        next(error);
    }
};
const assignDeliveryRider = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        throw new AuthenticationError_1.AuthenticationError("You are not authenticated");
    }
    const userId = req.user.id;
    const body = req.body;
    try {
        const order = await service_1.default.assignDeliveryService(body, userId);
        res.status(200).json(order);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getOngoingDeliveryOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const ongoingDeliveryOrders = await service_1.default.getOngoingDeliveryOrdersServices(page, limit);
        res.status(200).json(ongoingDeliveryOrders);
        return;
    }
    catch (error) {
        next(error);
    }
};
const readyForPickup = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        throw new AuthenticationError_1.AuthenticationError("You are not authenticated");
    }
    const userId = req.user.id;
    const id = req.params.id;
    try {
        const orderForPickup = await service_1.default.readyForPickupService(id, userId);
        res.status(200).json(orderForPickup);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getForPickupOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const forPickupOrders = await service_1.default.getForPickupOrdersService(page, limit);
        res.status(200).json(forPickupOrders);
        return;
    }
    catch (error) {
        next(error);
    }
};
const orderPickedup = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        throw new AuthenticationError_1.AuthenticationError("You are not authenticated");
    }
    const userId = req.user.id;
    const body = req.body;
    try {
        const pickedupOrder = await service_1.default.orderPickedupService(body, userId);
        res.status(200).json(pickedupOrder);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getTotalNumberOrders = async (req, res, next) => {
    try {
        const totalNumberOrders = await service_1.default.getTotalNumberOrdersService();
        res.status(200).json(totalNumberOrders);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getRiderPendingDeliveries = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        throw new AuthenticationError_1.AuthenticationError("You are not authenticated");
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const id = req.user.id;
    try {
        const pendingDeliveries = await service_1.default.getRiderPendingDeliveriesService(id, page, limit);
        res.status(201).json(pendingDeliveries);
        return;
    }
    catch (error) {
        next(error);
    }
};
const orderDelivered = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        throw new AuthenticationError_1.AuthenticationError("You are not authenticated");
    }
    const userId = req.user.id;
    const id = req.params.id;
    try {
        const order = await service_1.default.orderDeliveredService(id, userId);
        res.status(201).json(order);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getRiderDeliveredOrders = async (req, res, next) => {
    if (!req.user || typeof req.user === "string") {
        throw new AuthenticationError_1.AuthenticationError("You are not authenticated");
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const id = req.user.id;
    try {
        const myDeliveries = await service_1.default.getRiderDeliveredOrdersService(id, page, limit);
        res.status(201).json(myDeliveries);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getRecentOrders = async (req, res, next) => {
    try {
        const recentOrders = await service_1.default.getRecentOrdersService();
        res.status(201).json(recentOrders);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getOrders,
    getPendingOrders,
    getCompletedOrders,
    getOrder,
    acceptOrder,
    getAcceptedOrders,
    outForDelivery,
    getForDeliveryOrders,
    assignDeliveryRider,
    getOngoingDeliveryOrders,
    readyForPickup,
    getForPickupOrders,
    orderPickedup,
    getTotalNumberOrders,
    getRiderPendingDeliveries,
    orderDelivered,
    getRiderDeliveredOrders,
    getRecentOrders,
};
