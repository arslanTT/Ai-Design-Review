import cloudinary from "../config/cloudinary.config.js";

export const uploadToCloudinary = async (file: any) => {
  try {
    const base64Data = file.buffer.toString("base64");
    const datauri = `data:${file.mimetype};base64,${base64Data}`;

    const upload = await cloudinary.uploader.upload(datauri, {
      folder: "/new uploads",
      resource_type: "auto",
    });
    return upload;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload file to external service.");
  }
};
