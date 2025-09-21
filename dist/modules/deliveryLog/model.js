"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DeliveryLogSchema = new mongoose_1.default.Schema({
    rider: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "AdminUser",
        required: true,
    },
    order: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Orders",
        required: true,
    },
    status: {
        type: String,
        enum: ["assigned", "in-transit", "delivered", "failed"],
        default: "assigned",
    },
    deliveredAt: {
        type: Date,
    },
}, { timestamps: true });
DeliveryLogSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const DeliveryLog = mongoose_1.default.model("DeliveryLog", DeliveryLogSchema);
exports.default = DeliveryLog;
