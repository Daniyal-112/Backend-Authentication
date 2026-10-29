import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "./cookieOptions.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: ACCESS_TOKEN_MAX_AGE / 1000,
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
      expiresIn: REFRESH_TOKEN_MAX_AGE / 1000,
    },
  );
};
