// import multer from "multer";
// const storage = multer.memoryStorage();
// export const upload = multer({
//   storage: multer.memoryStorage(),
// });
import multer from "multer";
import { type Request } from "express";

// File filter for better validation
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.")
    );
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: fileFilter,
});
