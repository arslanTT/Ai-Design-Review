import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { type IUser } from "../models/user.model.js";
declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error in authentication" });
  }
};
