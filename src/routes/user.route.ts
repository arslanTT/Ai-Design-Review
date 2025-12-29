import express from "express";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/protect.middleware.js";
import { validate } from "../middleware/validate.js";
import { signinSchema, signupSchema } from "../middleware/zodValidateSchema.js";
const router = express.Router();

router.post("/register", validate(signupSchema), register);
router.post("/login", validate(signinSchema), login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
