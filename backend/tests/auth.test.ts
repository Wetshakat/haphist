import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { app } from "../src/server";
import { prisma } from "../src/lib/prisma";

const enabled = Boolean(process.env.DATABASE_URL);
const suite = enabled ? describe : describe.skip;
const email = `test-${Date.now()}@example.com`;

suite("authentication API", () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("registers a user and sets an HTTP-only cookie", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      username: `test_${Date.now()}`,
      email,
      password: "Password123!",
      dateOfBirth: "2000-01-01",
    });

    expect(response.status).toBe(201);
    expect(response.body.user).not.toHaveProperty("passwordHash");
    expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
  });

  it("returns structured validation errors", async () => {
    const response = await request(app).post("/api/auth/register").send({ email: "bad" });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("rejects invalid credentials generically", async () => {
    const response = await request(app).post("/api/auth/login").send({ email, password: "wrong-password" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid email or password" });
  });

  it("rejects missing authentication", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });

  it("returns a generic forgot-password response", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({ email: "unknown@example.com" });
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("If an account exists");
  });

  it("logs out safely", async () => {
    const response = await request(app).post("/api/auth/logout");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Logged out successfully" });
  });
});