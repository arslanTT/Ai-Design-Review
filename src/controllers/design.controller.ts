import type { Request, Response } from "express";
// import { uploadToS3 } from "../services/s3.service.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import Design from "../models/design.model.js";
import designCritiqueEventBus from "../config/designCritiqueEvent.config.js";

import APIFeatures from "../utils/apiFeatures.js";
export const uploadFile = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }
  try {
    const file = req.file;
    const { title, description } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title and  description are required",
      });
    }
    if (!file) {
      return res.status(400).json({ message: "Please upload a file" });
    }
    const ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const MAX_FILE_SIZE = 1024 * 1024 * 10;
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        message: `Invalid file type. Allowed file types are ${ALLOWED_MIME_TYPES.join(
          ", "
        )}`,
      });
    }
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        message: `File too large. Maximum size: ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      });
    }

    const uploadResult = await uploadToCloudinary(file);
    // console.log("=====================", uploadResult);
    const design = await Design.create({
      title: title || "Default Title",
      description: description || "description",
      owner: req.user._id,
      imageDetails: {
        asset_id: uploadResult.asset_id,
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });

    designCritiqueEventBus.emit("design:critique-event", design._id.toString());

    return res.status(200).json({
      success: true,
      message: "Design uploaded successfully",
      data: {
        _id: design._id,
        title: design.title,
        description: design.description,
        imageUrl: design.imageDetails.url,
        status: design.status,
      },
    });
  } catch (error: any) {
    console.log("Upload error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      message: "Internal server error. Could not process upload.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const sortAndInitialQuery = async (req: Request, res: Response) => {
  try {
    const queryString = req.query;
    const features = new APIFeatures(Design.find().lean(), queryString)
      .sort()
      .paginate()
      .select()
      .populate();
    let designs = await features.query;
    const hasMore = designs.length > features.limit;
    if (hasMore) {
      designs.pop();
    }
    res.status(200).json({
      data: designs,
      pagination: {
        hasMore,
        page: features.page,
        limit: features.limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const getSingleDesignDoc = async (req: Request, res: Response) => {
  try {
    const designId = req.params.id;
    if (!designId) {
      return res.status(400).json({ message: "Please provide Design Id" });
    }

    const design = await Design.findById(designId)
      .populate({
        path: "owner",
        select: "username email",
      })
      .lean();

    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    res.status(200).json(design);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Server error" });
  }
};
