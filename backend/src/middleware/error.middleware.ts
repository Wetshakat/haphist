import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", errors: error.flatten().fieldErrors });
    return;
  }
  if (error?.name === "DuplicateEmailError" || error?.name === "DuplicateUsernameError") {
    res.status(409).json({ message: error.message });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({ message: "An account with those details already exists" });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "An unexpected server error occurred" });
};