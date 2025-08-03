import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import config from "./config";

export const uploadImage = async (image: Express.Multer.File) => {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });

  try {
    console.log("Uploading files from the browser");

    const buffer = image.buffer;

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
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
      }
    );

    if (!uploadResult || !uploadResult.public_id) {
      throw new Error("Upload failed, no response from Cloudinary");
    }

    const publicId = uploadResult.public_id;

    const optimizeUrl = cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
    });

    return {
      optimizeUrl,
      publicId,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
