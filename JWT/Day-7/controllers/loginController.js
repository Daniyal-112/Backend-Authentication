import bcrypt from "bcrypt";
import User from "../models/user.js";

import {
  cookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "../utils/cookieOptions.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import saveRefreshToken from "../utils/saveRefreshToken.js";

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const checkUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!checkUser) {
      return res.status(401).json({
        message: "Invalid email",
      });
    }

    const isMatch = await bcrypt.compare(password, checkUser.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const accessToken = generateAccessToken(checkUser);
    const refreshToken = generateRefreshToken(checkUser);

    await saveRefreshToken(checkUser._id, refreshToken);

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return res.status(200).json({
      message: "Login Successful",
      role: checkUser.role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

export default userLogin;
