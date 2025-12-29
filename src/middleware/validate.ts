import type { NextFunction, Request, Response } from "express";
import { Schema } from "zod/v3";

export const validate =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      let firstError = result.error.issues[0]?.message;
      res.status(400).json({ message: firstError });
      return;
    }
    req.body = result.data;
    next();
  };
