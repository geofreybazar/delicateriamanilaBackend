"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectToDB;
const mongoose_1 = __importDefault(require("mongoose"));
function connectToDB(url) {
    mongoose_1.default.connect(url).then((_) => console.log("Connected to DB"));
}
