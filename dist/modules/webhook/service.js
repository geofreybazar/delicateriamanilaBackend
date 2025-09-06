"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../orders/model"));
const model_3 = __importDefault(require("../checkoutSession/model"));
const model_4 = __importDefault(require("../products/model"));
const validation_1 = require("./validation");
const model_5 = __importDefault(require("../cartStorage/model"));
const ValidationError_1 = require("../../config/ValidationError");
const NotFoundError_1 = require("../../config/NotFoundError");
const socket_1 = require("../../config/socket");
const model_6 = __importDefault(require("../clientUsers/model"));
const acceptWebhookEndpointService = async (webhookbody) => {
    const parsed = validation_1.WebhookEventSchema.safeParse(webhookbody);
    if (!parsed.success) {
        console.log("Invalid webhook payload", parsed.error);
        return;
    }
    const event = parsed.data;
    const existingWebhook = await model_1.default.findOne({ eventId: event.data.id });
    if (existingWebhook) {
        console.log("Duplicate webhook event");
        return { success: false, message: "Duplicate event" };
    }
    const newWebhook = await model_1.default.create({
        eventId: event.data.id,
        type: event.data.attributes.type,
        livemode: event.data.attributes.livemode,
        data: event,
    });
    const reference_number = event.data.attributes.data.attributes.reference_number;
    if (!reference_number?.includes("_")) {
        console.error("Invalid reference number format");
        return { success: false, message: "Invalid reference format" };
    }
    const [sessionId, cartId] = reference_number.split("_");
    const cartStorage = await model_5.default.findById(cartId);
    const clientUserId = cartStorage?.clientUserId;
    if (event.data.attributes.type === "checkout_session.payment.paid") {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const checkoutData = event.data.attributes.data.attributes;
            const payment = checkoutData.payments?.[0]?.attributes;
            const netAmount = payment.net_amount / 100;
            const paymongoFee = payment.fee / 100;
            const totalClientPaid = payment?.amount / 100;
            const paymentBrand = payment?.source?.brand;
            const paymentId = payment?.source?.id;
            const paymentType = payment?.source?.type;
            const paymentLast4 = payment?.source?.last4;
            const shippingFeeItem = checkoutData.line_items.filter((item) => item.name === "Shipping Fee");
            const orderedItems = checkoutData.line_items.filter((item) => item.name !== "Shipping Fee");
            const newOrder = await model_2.default.create([
                {
                    webhookId: event.data.id,
                    referenceNumber: reference_number,
                    clientUserId,
                    type: event.data.attributes.type,
                    paymentStatus: "payment received",
                    paymentMethod: {
                        paymentBrand,
                        paymentId,
                        paymentType,
                        paymentLast4,
                    },
                    deliveryFee: shippingFeeItem[0].amount / 100,
                    orderStatus: "pending",
                    netAmount,
                    totalClientPaid,
                    paymongoFee,
                    customerDetails: {
                        name: payment?.billing?.name,
                        email: payment?.billing?.email,
                        phoneNumber: payment?.billing?.phone,
                    },
                    deliveryAddress: {
                        line1: payment.billing?.address.line1,
                        city: payment.billing?.address.city,
                        postalCode: payment.billing?.address.postal_code,
                        state: payment.billing?.address.state,
                    },
                    itemsOrdered: orderedItems,
                },
            ], { session });
            await model_3.default.findByIdAndUpdate(sessionId, {
                status: "paid",
            }, { session });
            await model_5.default.findByIdAndUpdate(cartId, {
                status: "completed",
            }, { session });
            await model_6.default.findByIdAndUpdate(clientUserId, { $push: { orders: newOrder[0].id } }, { new: true, session });
            await model_4.default.updateMany({ "reservedStock.cartId": cartId }, { $pull: { reservedStock: { cartId } } }, { session });
            await session.commitTransaction();
            // socket io event
            (0, socket_1.getIO)().emit("orderCreated", {
                newOrder,
            });
        }
        catch (error) {
            await session.abortTransaction();
            console.error("Transaction failed:", error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    return newWebhook;
};
const getPaymentsService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
        model_1.default.find({}).skip(skip).limit(limit),
        model_1.default.countDocuments(),
    ]);
    return {
        payments,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getPaymentService = async (id) => {
    if (!id || !validation_1.getPaymentServiceSchema.safeParse(id).success) {
        throw new ValidationError_1.ValidationError("Invalid product id");
    }
    const payment = await model_1.default.findById(id);
    if (!payment) {
        throw new NotFoundError_1.NotFoundError("Product not found");
    }
    return payment;
};
exports.default = {
    acceptWebhookEndpointService,
    getPaymentsService,
    getPaymentService,
};
