import User from "../models/user.js";

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.statu(200).json({
      message: "User profile fetch Successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Profile fetch failed",
    });
  }
};

export default getProfile;
