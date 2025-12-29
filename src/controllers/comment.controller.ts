import type { Request, Response } from "express";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import Design from "../models/design.model.js";
import mongoose from "mongoose";

export const feedbackOnDesign = async (req: Request, res: Response) => {
  try {
    const designId = req.params.id;
    const userId = req.user?._id;
    const { feedback } = req.body;
    if (!feedback || feedback.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide feedback",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated request. Please log in.",
      });
    }

    if (!designId) {
      return res.status(400).json({
        success: false,
        message: "Design ID is required",
      });
    }

    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    const comment = await Comment.create({
      user: userId,
      desginPostID: design._id,
      feedback: feedback.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "username email")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Your feedback has been submitted",
      data: populatedComment,
    });
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const PAGE_LIMIT = 10;
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * PAGE_LIMIT;

    const designId = req.params.id;
    if (!designId) {
      return res.status(400).json({
        success: false,
        message: "Design ID required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(designId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid design ID format",
      });
    }

    const convertedId = new mongoose.Types.ObjectId(designId);

    const designExists = await Design.exists({ _id: convertedId });
    if (!designExists) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    const comments = await Comment.aggregate([
      { $match: { desginPostID: convertedId } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: PAGE_LIMIT },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          feedback: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: "$userDetails._id",
            username: "$userDetails.username",
            email: "$userDetails.email",
          },
        },
      },
    ]);

    const totalComments = await Comment.countDocuments({
      desginPostID: convertedId,
    });

    const totalPages = Math.ceil(totalComments / PAGE_LIMIT);
    const hasMore = page < totalPages;

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total: totalComments,
        page,
        limit: PAGE_LIMIT,
        totalPages,
        hasMore,
      },
    });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments. Server error.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated request",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
