import jwt from "jsonwebtoken";
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";
import hashToken from "../utils/hashToken.js";
import saveRefreshToken from "../utils/saveRefreshToken.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import {
  cookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "../utils/cookieOptions.js";

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh Token is missing. Please Login again",
    });
  }
  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Refresh Token. Please login again",
    });
  }

  try {
    const storedToken = await RefreshToken.findOne({
      tokenHash: hashToken(refreshToken),
    });

    if (!storedToken) {
      await RefreshToken.deleteMany({
        user: decoded.userId,
      });
      return res.status(401).json({
        message: "Refresh Token revoked. Please login again",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      await storedToken.deleteOne();

      return res.status(401).json({
        message: "User not found. Please login again",
      });
    }

    await storedToken.deleteOne();

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await saveRefreshToken(user._id, newRefreshToken);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return res.status(200).json({
      message: "Token refreshed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Token refresh failed",
    });
  }
};

export default refreshAccessToken;
