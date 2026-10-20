import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { generateAccessToken } from "../utils/generateToken.js";

import {
  ACCESS_TOKEN_MAX_AGE,
  cookieOptions,
  REFRESH_TOKEN_MAX_AGE,
} from "../utils/cookieOptions.js";

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token is missing please login again",
    });
  }
  try {
    const verifyRefreshToken = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    const user = await User.findById(verifyRefreshToken.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    const newAccessToken = generateAccessToken(user);
    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    return res.status(200).json({
      message: "Access Token refreshed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Invalid or expired Refresh Token. please login again",
    });
  }
};

export default refreshAccessToken;
