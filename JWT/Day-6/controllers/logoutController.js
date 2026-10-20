import { cookieOptions } from "../utils/cookieOptions.js";

const userLogout = (req, res) => {
  
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    message: "Logout successful",
  });
};

export default userLogout;
