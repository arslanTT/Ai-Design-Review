import express from "express";
const router = express.Router();
import {
  feedbackOnDesign,
  getComments,
} from "../controllers/comment.controller.js";
import { protect } from "../middleware/protect.middleware.js";

router.post("/:id", protect, feedbackOnDesign);
router.get("/:id", getComments);
export default router;
