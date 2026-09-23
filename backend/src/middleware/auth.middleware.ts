import type { RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.cookies?.faceb0ok_token;
  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    req.userId = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired authentication" });
  }
};