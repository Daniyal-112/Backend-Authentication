import cookieOptions from "../utils/cookieOptions.js";

const userLogout = (req, res) => {
  req.clearCookie("token", cookieOptions);
  return res.status(200).json({
    message: "Logout successfully",
  });
};

export default userLogout;
