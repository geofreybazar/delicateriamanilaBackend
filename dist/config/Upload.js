"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("./config"));
const uploadImage = async (image) => {
    cloudinary_1.v2.config({
        cloud_name: config_1.default.CLOUDINARY_NAME,
        api_key: config_1.default.CLOUDINARY_API_KEY,
        api_secret: config_1.default.CLOUDINARY_API_SECRET,
    });
    try {
        console.log("Uploading files from the browser");
        const buffer = image.buffer;
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream((error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("Cloudinary returned no result"));
                }
                resolve(result);
            });
            stream.end(buffer);
        });
        if (!uploadResult || !uploadResult.public_id) {
            throw new Error("Upload failed, no response from Cloudinary");
        }
        const publicId = uploadResult.public_id;
        const optimizeUrl = cloudinary_1.v2.url(publicId, {
            fetch_format: "auto",
            quality: "auto",
        });
        return {
            optimizeUrl,
            publicId,
        };
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
exports.uploadImage = uploadImage;
