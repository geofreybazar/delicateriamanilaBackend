import { v2 as cloudinary } from "cloudinary";
import config from "./config";

export const deleteImage = async (publicId: string) => {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });

  try {
    console.log("Deleting images from the browser");

    const deleteImage = await cloudinary.uploader.destroy(publicId);

    return {
      deleteImage,
    };
  } catch (error) {
    console.log(error);
  }
};
