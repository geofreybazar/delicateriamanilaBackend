"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CartStorageSchema = new mongoose_1.default.Schema({
    items: [
        {
            productid: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Products",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    status: {
        type: String,
        default: "pending",
    },
    clientUserId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ClientUser",
        required: false,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    isFreeDelivery: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true });
CartStorageSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const CartStorage = mongoose_1.default.model("CartStorage", CartStorageSchema);
exports.default = CartStorage;
1;
