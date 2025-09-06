"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CheckoutSessionSchema = new mongoose_1.default.Schema({
    cartId: String,
    items: [
        {
            productId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Products",
                required: true,
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            imgUrl: { type: String, required: true },
            description: { type: String, required: true },
        },
    ],
    isFreeDelivery: { type: Boolean, required: true },
    deliveryFee: { type: Number },
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
});
CheckoutSessionSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const CheckoutSession = mongoose_1.default.model("CheckoutSession", CheckoutSessionSchema);
exports.default = CheckoutSession;
