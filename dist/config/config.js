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
    NODE_ENV: getEnvVar("NODE_ENV"),
    JWT_SECRET: getEnvVar("JWT_SECRET"),
    REFRESH_SECRET: getEnvVar("REFRESH_SECRET"),
    MONGO_URI: getEnvVar("MONGO_URI"),
    CLOUDINARY_NAME: getEnvVar("CLOUDINARY_NAME"),
    CLOUDINARY_API_KEY: getEnvVar("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnvVar("CLOUDINARY_API_SECRET"),
    CLOUDINARY_URL: getEnvVar("CLOUDINARY_URL"),
    PAYMONGO_PUBLIC_KEY_TEST: getEnvVar("PAYMONGO_PUBLIC_KEY_TEST"),
    PAYMONGO_SECRET_KEY_TEST: getEnvVar("PAYMONGO_SECRET_KEY_TEST"),
    PAYMONGO_SECRET_KEY_TEST_BASE64: getEnvVar("PAYMONGO_SECRET_KEY_TEST_BASE64"),
    DEFAULT_PASSWORD: getEnvVar("DEFAULT_PASSWORD"),
    PRODUCTION_URL: getEnvVar("PRODUCTION_URL"),
};
exports.default = config;
