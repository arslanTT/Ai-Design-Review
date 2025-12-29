// import type { Request, Response } from "express";
// import User from "../models/user.model.js";
// import jwt from "jsonwebtoken";
// import type {
//   // SigninBody,
//   SignupBody,
// } from "../middleware/zodValidateSchema.js";
// const generateToken = (id: string) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "30d" });
// };

// export const register = async (req: Request, res: Response) => {
//   try {
//     const { username, email, password }: SignupBody = req.body;
//     const olduser = await User.findOne({ email: email });
//     if (olduser) {
//       return res
//         .status(400)
//         .json({ message: "user with this email already exists" });
//     }
//     const user = await User.create({
//       username: username,
//       email: email,
//       password: password,
//     });
//     const token = generateToken(user._id.toString());
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 24 * 60 * 60 * 1000,
//     });
//     return res
//       .status(200)
//       .json({ _id: user._id, name: user.username, email: user.email, token });
//   } catch (error) {
//     return res.status(500).json({ message: "Internal Server Error.", error });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//     }
//     if (user && (await user.comparepassword(password))) {
//       const token = generateToken(user._id.toString());
//       res.cookie("token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 24 * 60 * 60 * 1000,
//       });
//       return res
//         .status(200)
//         .json({ _id: user._id, name: user.username, email: user.email, token });
//       return;
//     } else {
//       res.status(401).json({ message: "Invalid email or password" });
//       return;
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error.", error });
//   }
// };
// export const logout = async (req: Request, res: Response) => {
//   try {
//     if (req.user) {
//       res.cookie("token", "", {
//         httpOnly: true,
//         expires: new Date(0),
//       });
//     } else {
//       res.status(400).json({ message: "Unauthorized Request" });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Server is not responding. Unable to log out." });
//   }
// };

// export const deleteAccount = async (req: Request, res: Response) => {
//   try {
//     if (req.user) {
//       await User.findByIdAndDelete(req.user._id);
//     } else {
//       res.status(400).json({ message: "Unauthorized Request" });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Server is not responding. Unable to delete account." });
//   }
// };
import type { Request, Response } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id.toString());
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparepassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id.toString());
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("token", "", { expires: new Date(0), httpOnly: true });
    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await User.findByIdAndDelete(req.user._id);
  res.cookie("token", "", { expires: new Date(0), httpOnly: true });

  return res.status(200).json({ message: "Account deleted" });
};
export const getMe = (req: Request, res: Response) => {
  return res.status(200).json({
    user: req.user,
  });
};
