"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../products/model"));
const model_3 = __importDefault(require("../cartStorage/model"));
const validation_1 = require("./validation");
const generatePaymentBody_1 = require("../../config/generatePaymentBody");
const ValidationError_1 = require("../../config/ValidationError");
const NotFoundError_1 = require("../../config/NotFoundError");
const NoEnoughStockError_1 = require("../../config/NoEnoughStockError");
const revalidateTag_1 = require("../../config/revalidateTag");
const paymentPageRequest_1 = require("../../config/paymentPageRequest");
const createCheckoutSessionService = async (body) => {
    const parsed = validation_1.CheckoutSessionSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    const validatedBody = parsed.data;
    const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    const existingSession = await model_1.default.findOne({
        cartId: validatedBody.cartId,
    }).session(session);
    const itemsToSave = validatedBody.items.map((item) => ({
        productId: new mongoose_1.Types.ObjectId(item.productid),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imgUrl: item.imgUrl,
    }));
    let checkoutSession;
    if (existingSession) {
        if (existingSession.status === "expired") {
            return { message: "Chekout Session expired!" };
        }
        checkoutSession = await model_1.default.findOneAndUpdate({ cartId: validatedBody.cartId }, {
            $set: {
                items: itemsToSave,
                totalPrice: validatedBody.totalPrice,
                expiresAt: expiresAt,
                isFreeDelivery: validatedBody.isFreeDelivery,
            },
        }, { new: true }).session(session);
    }
    else {
        const created = await model_1.default.create([
            {
                cartId: validatedBody.cartId,
                items: itemsToSave,
                expiresAt,
                totalPrice: validatedBody.totalPrice,
                isFreeDelivery: validatedBody.isFreeDelivery,
            },
        ], { session });
        checkoutSession = created[0];
    }
    const notEnoughStock = [];
    const productIds = body.items.map((item) => item.productid);
    const products = await model_2.default.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map();
    products.forEach((product) => {
        productMap.set(product._id.toString(), product);
    });
    for (const item of validatedBody.items) {
        const product = productMap.get(item.productid);
        if (!product) {
            await session.abortTransaction();
            throw new NotFoundError_1.NotFoundError("Product not Found");
        }
        const userReservation = product.reservedStock.find((r) => r.cartId === validatedBody.cartId);
        const userHasReserved = userReservation?.quantity || 0;
        const availableStock = product.stockQuantity + userHasReserved;
        if (availableStock < item.quantity) {
            notEnoughStock.push({
                productName: product.name,
                availableStock,
                id: item.productid,
            });
        }
        await product.save({ session });
    }
    if (notEnoughStock.length > 0) {
        const cart = await model_3.default.findById(validatedBody.cartId);
        if (cart) {
            const outOfStockIds = notEnoughStock.map((item) => item.id.toString());
            for (const id of outOfStockIds) {
                cart.items.pull({ productid: id });
            }
            // Recalculate total price
            let newTotal = 0;
            for (const item of cart.items) {
                const product = productMap.get(item.productid.toString());
                if (product) {
                    newTotal += product.price * item.quantity;
                }
            }
            cart.totalPrice = newTotal;
            await cart.save();
        }
        await session.abortTransaction();
        session.endSession();
        return {
            message: "Some items are out of stock, refresh to update",
            itemsNoStock: notEnoughStock,
        };
    }
    for (const item of validatedBody.items) {
        const product = productMap.get(item.productid);
        if (!product) {
            await session.abortTransaction();
            throw new NotFoundError_1.NotFoundError("Product not found");
        }
        // Check if user already has a reservation
        const existingReservation = product.reservedStock.find((r) => r.cartId === validatedBody.cartId);
        const newQuantity = item.quantity;
        if (existingReservation) {
            const previousQuantity = existingReservation.quantity;
            const diff = newQuantity - previousQuantity;
            if (diff > 0) {
                // Need to deduct more from stock
                if (product.stockQuantity < diff) {
                    await session.abortTransaction();
                    throw new NoEnoughStockError_1.NoEnoughStockError("Not enough stock to increase quantity");
                }
                product.stockQuantity -= diff;
            }
            else if (diff < 0) {
                // User reduced quantity — return stock
                product.stockQuantity += Math.abs(diff);
            }
            existingReservation.quantity = newQuantity;
            existingReservation.expiresAt = expiresAt;
        }
        else {
            // New reservation
            if (product.stockQuantity < newQuantity) {
                await session.abortTransaction();
                throw new NoEnoughStockError_1.NoEnoughStockError("Not enough stock to reserve");
            }
            product.stockQuantity -= newQuantity;
            product.reservedStock.push({
                cartId: body.cartId,
                quantity: newQuantity,
            });
        }
        await product.save({ session });
    }
    await session.commitTransaction();
    await (0, revalidateTag_1.revalidateTag)("checkoutSession");
    session.endSession();
    await (0, revalidateTag_1.revalidateTag)("products");
    await (0, revalidateTag_1.revalidateTag)("checkoutSession");
    return checkoutSession;
};
const getCheckoutSessionService = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ValidationError_1.ValidationError("Invalid session ID");
    }
    const checkoutSession = await model_1.default.findById(id);
    if (!checkoutSession) {
        throw new NotFoundError_1.NotFoundError("Checkout session not found");
    }
    return checkoutSession;
};
const createPaymongoPaymentRequestService = async (body) => {
    const parsed = validation_1.CreatePaymongoPaymentRequestSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    const data = (0, generatePaymentBody_1.generatePaymentBody)(body);
    const paymongoPayment = await (0, paymentPageRequest_1.paymentPageRequest)(data);
    if (!paymongoPayment) {
        await session.abortTransaction();
        throw new ValidationError_1.ValidationError("Payment request failed");
    }
    await session.commitTransaction();
    session.endSession();
    await (0, revalidateTag_1.revalidateTag)("products");
    return paymongoPayment.data.attributes.checkout_url;
};
exports.default = {
    createCheckoutSessionService,
    getCheckoutSessionService,
    createPaymongoPaymentRequestService,
};
