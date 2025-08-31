"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const clientUserSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    provider: {
        type: String,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    orders: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Orders",
        },
    ],
}, { timestamps: true });
clientUserSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const ClientUser = mongoose_1.default.model("ClientUser", clientUserSchema);
exports.default = ClientUser;
