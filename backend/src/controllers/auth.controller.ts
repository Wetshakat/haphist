import type { RequestHandler } from "express";
import { forgotPasswordSchema, loginSchema, registerSchema } from "../schemas/auth.schema";
import { authenticate, findById, register } from "../services/auth.service";
import { generateToken } from "../utils/jwt";

const cookieName = "faceb0ok_token";
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

export const registerUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await register(registerSchema.parse(req.body));
    res.cookie(cookieName, generateToken(user.id), cookieOptions());
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const credentials = loginSchema.parse(req.body);
    const user = await authenticate(credentials);
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    res.cookie(cookieName, generateToken(user.id), cookieOptions());
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(cookieName, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  res.json({ message: "Logged out successfully" });
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await findById(req.userId as string);
    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    forgotPasswordSchema.parse(req.body);
    res.json({ message: "If an account exists for this email, password-reset instructions would be sent." });
  } catch (error) {
    next(error);
  }
};