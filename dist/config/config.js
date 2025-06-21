"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnvVar(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`Missing environment variable: ${name}`);
    return value;
}
const config = {
    PORT: Number(process.env.PORT) || 3005,
    JWT_SECRET: getEnvVar("JWT_SECRET"),
    REFRESH_SECRET: getEnvVar("REFRESH_SECRET"),
    MONGO_URI: getEnvVar("MONGO_URI"),
    CLOUDINARY_NAME: getEnvVar("CLOUDINARY_NAME"),
    CLOUDINARY_API_KEY: getEnvVar("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnvVar("CLOUDINARY_API_SECRET"),
    CLOUDINARY_URL: getEnvVar("CLOUDINARY_URL"),
};
exports.default = config;
