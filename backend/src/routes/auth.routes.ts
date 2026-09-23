import { Router } from "express";
import { forgotPassword, login, logout, me, registerUser } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimit, loginRateLimit } from "../middleware/rate-limit.middleware";

export const authRouter = Router();

authRouter.post("/register", authRateLimit, registerUser);
authRouter.post("/login", loginRateLimit, login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.post("/forgot-password", authRateLimit, forgotPassword);