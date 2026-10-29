import RefreshToken from "../models/refreshToken.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import hashToken from "../utils/hashToken.js";

const userLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      message: "Logout Successful",
    });
  } catch (error) {
    return res.staus(500).json({
      message: "Logout failed",
    });
  }
};

const logoutAllDevices = async (req, res) => {
  try {
    await RefreshToken.deleteMany({ user: req.user.userId });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.staus(200).json({
      message: "Logout from all devices successful",
    });
  } catch (error) {
    return res.staus(500).json({
      message: "Logout failed",
    });
  }
};

export { userLogout, logoutAllDevices };
