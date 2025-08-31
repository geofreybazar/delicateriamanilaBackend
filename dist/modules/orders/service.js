"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../adminUsers/model"));
const model_3 = __importDefault(require("../deliveryLog/model"));
const model_4 = __importDefault(require("../staffActivityLog/model"));
const ValidationError_1 = require("../../config/ValidationError");
const NotFoundError_1 = require("../../config/NotFoundError");
const validation_1 = require("./validation");
const socket_1 = require("../../config/socket");
const getOrdersService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        model_1.default.find({}).skip(skip).limit(limit),
        model_1.default.countDocuments(),
    ]);
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getPendingOrdersService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        model_1.default.find({ orderStatus: "pending" }).skip(skip).limit(limit),
        model_1.default.countDocuments({ orderStatus: "pending" }),
    ]);
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getCompletedOrdersService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [pickedupOrders, totalPickedupOrders] = await Promise.all([
        model_1.default.find({ orderStatus: "picked up" }).skip(skip).limit(limit),
        model_1.default.countDocuments({ orderStatus: "picked up" }),
    ]);
    const [deliveredOrders, totaldeliveredOrders] = await Promise.all([
        model_1.default.find({ orderStatus: "delivered" }).skip(skip).limit(limit),
        model_1.default.countDocuments({ orderStatus: "delivered" }),
    ]);
    const orders = [...pickedupOrders, ...deliveredOrders];
    const total = totalPickedupOrders + totaldeliveredOrders;
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getOrderService = async (id) => {
    const parsed = validation_1.orderIdSchema.safeParse(id);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Order id");
    }
    const parsedId = parsed.data;
    const order = await model_1.default.findById(parsedId).populate("deliveryRider", {
        id: 1,
        firstname: 1,
        lastname: 1,
        middlename: 1,
    });
    if (!order) {
        throw new NotFoundError_1.NotFoundError("Order not Found!");
    }
    return order;
};
const acceptOrderService = async (id, userId) => {
    const parsed = validation_1.orderIdSchema.safeParse(id);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Order id");
    }
    const parsedId = parsed.data;
    const acceptedOrder = await model_1.default.findByIdAndUpdate(parsedId, {
        orderStatus: "accepted",
    });
    if (!acceptedOrder) {
        throw new NotFoundError_1.NotFoundError("Order not Found!");
    }
    await model_4.default.create({
        staff: userId,
        order: acceptedOrder.id,
        action: "accepted",
    });
    return acceptedOrder;
};
const getAcceptedOrderServices = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        model_1.default.find({ orderStatus: "accepted" }).skip(skip).limit(limit),
        model_1.default.countDocuments({ orderStatus: "accepted" }),
    ]);
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const outForDeliveryService = async (id, userId) => {
    const parsed = validation_1.orderIdSchema.safeParse(id);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Order id");
    }
    const parsedId = parsed.data;
    const outForDeliveryOrder = await model_1.default.findByIdAndUpdate(parsedId, {
        orderStatus: "for delivery",
    });
    if (!outForDeliveryOrder) {
        throw new NotFoundError_1.NotFoundError("Order not Found!");
    }
    await model_4.default.create({
        staff: userId,
        order: outForDeliveryOrder.id,
        action: "for delivery",
    });
    return outForDeliveryOrder;
};
const getForDeliveryOrdersServices = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        model_1.default.find({ orderStatus: "for delivery" }).skip(skip).limit(limit),
        model_1.default.countDocuments({ orderStatus: "for delivery" }),
    ]);
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const assignDeliveryService = async (body, userId) => {
    const parsed = validation_1.AssignDeliveryServiceSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Order id");
    }
    const parsedata = parsed.data;
    const { orderId, riderId } = parsedata;
    const order = await model_1.default.findById(orderId);
    const rider = await model_2.default.findById(riderId);
    if (!order || !rider) {
        throw new NotFoundError_1.NotFoundError("Order or Rider not Found!");
    }
    const updatedOrder = await model_1.default.findByIdAndUpdate(orderId, { deliveryRider: riderId, orderStatus: "ongoing delivery" }, { new: true });
    const newDeliveryLog = await model_3.default.create({
        rider: rider.id,
        order: order.id,
        status: "assigned",
    });
    if (!updatedOrder || !newDeliveryLog) {
        throw new NotFoundError_1.NotFoundError("Failed to assign delivery rider!");
    }
    await model_4.default.create({
        staff: userId,
        order: order.id,
        action: `assigned to rider:${rider.firstname} ${rider.lastname}`,
    });
    // socket io event
    (0, socket_1.getIO)().emit("orderDeliveryAssigned", {
        updatedOrder,
    });
    return {
        order: updatedOrder,
        deliveryLog: newDeliveryLog,
    };
};
const getOngoingDeliveryOrdersServices = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        model_1.default.find({ orderStatus: "ongoing delivery" }).skip(skip).limit(limit),
        model_1.default.countDocuments({ orderStatus: "ongoing delivery" }),
    ]);
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const readyForPickupService = async (id, userId) => {
    const parsed = validation_1.orderIdSchema.safeParse(id);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Order id");
    }
    const parsedId = parsed.data;
    const orderForPickup = await model_1.default.findByIdAndUpdate(parsedId, {
        orderStatus: "for pickup",
    });
    if (!orderForPickup) {
        throw new NotFoundError_1.NotFoundError("Order not Found!");
    }
    await model_4.default.create({
        staff: userId,
        order: orderForPickup.id,
        action: "for pickup",
    });
    return orderForPickup;
};
const getForPickupOrdersService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        model_1.default.find({ orderStatus: "for pickup" }).skip(skip).limit(limit),
        model_1.default.countDocuments({ orderStatus: "for pickup" }),
    ]);
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const orderPickedupService = async (body, userId) => {
    const parsed = validation_1.OrderPickedupServiceSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Order id");
    }
    const { orderId, trackingNumber, modeOfPickup, pickupPersonName, validId, idNumber, contactNumber, pickupDateAndTime, } = parsed.data;
    const acceptedOrder = await model_1.default.findByIdAndUpdate(orderId, {
        orderStatus: "picked up",
        pickupDetails: {
            trackingNumber,
            modeOfPickup,
            pickupPersonName,
            validId,
            idNumber,
            contactNumber,
            pickupDateAndTime,
        },
    });
    if (!acceptedOrder) {
        throw new NotFoundError_1.NotFoundError("Order not Found!");
    }
    await model_4.default.create({
        staff: userId,
        order: acceptedOrder.id,
        action: "picked up",
    });
    return acceptedOrder;
};
const getTotalNumberOrdersService = async () => {
    const result = await model_1.default.aggregate([
        {
            $group: {
                _id: "$orderStatus",
                count: { $sum: 1 },
            },
        },
    ]);
    // Transform aggregation result into a lookup
    const counts = {};
    result.forEach(({ _id, count }) => {
        counts[_id] = count;
    });
    const completedOrders = (counts["picked up"] || 0) + (counts["delivered"] || 0);
    return {
        pendingOrders: counts["pending"] || 0,
        acceptedOrders: counts["accepted"] || 0, // ⚠️ you missed returning this in your original function
        forPickUpOrders: counts["for pickup"] || 0,
        forDeliveryOrders: counts["for delivery"] || 0,
        ongoingDeliveryOrders: counts["ongoing delivery"] || 0,
        completedOrders,
    };
};
const getRiderPendingDeliveriesService = async (id, page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        model_1.default.find({ deliveryRider: id, orderStatus: "ongoing delivery" })
            .skip(skip)
            .limit(limit),
        model_1.default.countDocuments({
            deliveryRider: id,
            orderStatus: "ongoing delivery",
        }),
    ]);
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const orderDeliveredService = async (id, userId) => {
    const parsed = validation_1.orderIdSchema.safeParse(id);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Order id");
    }
    const parsedId = parsed.data;
    const deliveredOrder = await model_1.default.findByIdAndUpdate(parsedId, {
        orderStatus: "delivered",
    });
    if (!deliveredOrder) {
        throw new NotFoundError_1.NotFoundError("Order not Found!");
    }
    await model_3.default.create({
        rider: userId,
        order: deliveredOrder.id,
        status: "delivered",
    });
    return deliveredOrder;
};
const getRiderDeliveredOrdersService = async (id, page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        model_1.default.find({ deliveryRider: id, orderStatus: "delivered" })
            .skip(skip)
            .limit(limit),
        model_1.default.countDocuments({
            deliveryRider: id,
            orderStatus: "delivered",
        }),
    ]);
    return {
        orders,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getRecentOrdersService = async () => {
    const recentOrders = await model_1.default.find().sort({ _id: -1 }).limit(3);
    return recentOrders;
};
exports.default = {
    getOrdersService,
    getPendingOrdersService,
    getCompletedOrdersService,
    getOrderService,
    acceptOrderService,
    getAcceptedOrderServices,
    outForDeliveryService,
    getForDeliveryOrdersServices,
    assignDeliveryService,
    getOngoingDeliveryOrdersServices,
    readyForPickupService,
    getForPickupOrdersService,
    orderPickedupService,
    getTotalNumberOrdersService,
    getRiderPendingDeliveriesService,
    orderDeliveredService,
    getRiderDeliveredOrdersService,
    getRecentOrdersService,
};
