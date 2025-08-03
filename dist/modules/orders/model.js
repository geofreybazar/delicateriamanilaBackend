"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OrderSchema = new mongoose_1.default.Schema({
    webhookId: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        required: true,
    },
    orderStatus: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    customerDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
    },
    deliveryAddress: {
        line1: { type: String },
        city: { type: String, required: true },
        postalCode: { type: Number, required: true },
        state: { type: String, required: true },
    },
    itemsOrdered: [
        {
            amount: { type: Number, required: true },
            currency: { type: String, required: true },
            desciption: { type: String },
            images: [{ type: String, required: true }],
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
    ],
}, { timestamps: true });
OrderSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const Orders = mongoose_1.default.model("Orders", OrderSchema);
exports.default = Orders;
