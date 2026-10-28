import RefreshToken from "../models/refreshToken.js";
import hashToken from "./hashToken.js";
import { REFRESH_TOKEN_MAX_AGE } from "./cookieOptions.js";

const saveRefreshToken = async (userId, refreshToken) => {
  await RefreshToken.create({
    user: userId,
    token: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
  });
};

export default saveRefreshToken;
