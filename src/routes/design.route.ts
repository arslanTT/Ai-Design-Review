import express from "express";
import {
  getSingleDesignDoc,
  sortAndInitialQuery,
  uploadFile,
} from "../controllers/design.controller.js";
import { upload } from "../middleware/multer.middleware.js";

import { protect } from "../middleware/protect.middleware.js";
const router = express.Router();
router.post("/upload", protect, upload.single("myFile"), uploadFile);
router.get("/", sortAndInitialQuery);
router.get("/find/:id", getSingleDesignDoc);

export default router;
