import jwt, { type SignOptions } from "jsonwebtoken";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

export function generateToken(userId: string): string {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  return jwt.sign({}, getSecret(), {
    subject: userId,
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): string {
  const payload = jwt.verify(token, getSecret());
  if (typeof payload === "string" || !payload.sub) {
    throw new Error("Invalid authentication token");
  }
  return payload.sub;
}