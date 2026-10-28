import crypto from "crypto";
import jwt from "jsonwebtoken";
import { use } from "react";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresAt: JWT_ACCESS_EXPIRES_IN || "10m",
    },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      jti: crypto.randomUUID(),
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REGRESH_EXPIRES_IN || "1d",
    },
  );
};
