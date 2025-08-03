"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("./config"));
const deleteImage = async (publicId) => {
    cloudinary_1.v2.config({
        cloud_name: config_1.default.CLOUDINARY_NAME,
        api_key: config_1.default.CLOUDINARY_API_KEY,
        api_secret: config_1.default.CLOUDINARY_API_SECRET,
    });
    try {
        console.log("Deleting images from the browser");
        const deleteImage = await cloudinary_1.v2.uploader.destroy(publicId);
        return {
            deleteImage,
        };
    }
    catch (error) {
        console.log(error);
    }
};
exports.deleteImage = deleteImage;
