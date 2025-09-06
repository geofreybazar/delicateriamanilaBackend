"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const StaffActivitySchema = new mongoose_1.default.Schema({
    staff: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "AdminUser",
        required: true,
    },
    order: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Orders",
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
}, { timestamps: true });
StaffActivitySchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const StaffActivity = mongoose_1.default.model("StaffActivity", StaffActivitySchema);
exports.default = StaffActivity;
