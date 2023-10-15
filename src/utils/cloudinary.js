import cloudinary from "cloudinary";
import env from "./environment";
cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImageCloud = async (file) => {
  try {
    const path = file.destination + "/" + file.filename;
    const result = await cloudinary.v2.uploader.upload(path, {
      public_id: file.size + Date.now(),
    });

    return result;
  } catch (error) {
    throw new Error("Upload to cloudinary failed: ", error);
  }
};

export const deleteFileCloudById = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    throw new Error("Delete file cloudinary failed");
  }
};

export const deleteImageCloud = async (attachment) => {
  if (attachment.storedBy !== "cloudinary") return;
  try {
    const lastNameUri = attachment.uri.split("/").pop();
    // Get public id
    const id = lastNameUri.split(".")[0];
    await deleteFileCloudById(id);
  } catch (error) {
    throw new Error("Delete image cloudinary failed");
  }
};
