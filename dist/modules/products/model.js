"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ProductSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    isOnSale: { type: Boolean, default: false },
    status: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Collection",
        required: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
    },
    reservedStock: [
        {
            cartId: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    featured: {
        type: Boolean,
        default: false,
    },
    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        },
    ],
}, { timestamps: true });
ProductSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const Products = mongoose_1.default.model("Products", ProductSchema);
exports.default = Products;
