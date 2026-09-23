import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import { hashPassword, comparePassword } from "../utils/password";

export type SafeUser = Omit<User, "passwordHash" | "updatedAt">;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, updatedAt: _updatedAt, ...safeUser } = user;
  return safeUser;
}

export async function register(input: RegisterInput): Promise<SafeUser> {
  const email = normalizeEmail(input.email);
  const username = input.username.trim();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    const error = new Error(existing.email === email ? "An account with this email already exists" : "That username is already taken");
    error.name = existing.email === email ? "DuplicateEmailError" : "DuplicateUsernameError";
    throw error;
  }

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      username,
      email,
      passwordHash: await hashPassword(input.password),
      dateOfBirth: input.dateOfBirth,
    },
  });
  return toSafeUser(user);
}

export async function authenticate(input: LoginInput): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(input.email) } });
  if (!user || !(await comparePassword(input.password, user.passwordHash))) return null;
  return toSafeUser(user);
}

export async function findById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toSafeUser(user) : null;
}