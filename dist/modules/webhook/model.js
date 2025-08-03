"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const webhookEventSchema = new mongoose_1.default.Schema({
    eventId: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
    },
    livemode: {
        type: Boolean,
        required: true,
    },
    data: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true,
    },
}, { timestamps: true });
webhookEventSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const Webhook = mongoose_1.default.model("Webhook", webhookEventSchema);
exports.default = Webhook;
