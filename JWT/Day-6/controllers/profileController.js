import User from "../models/user.js";

const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "USer not found",
      });
    }
    return res.status(200).json({
      message: "Profile fetch successful",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Profile fetch failed ",
      error: error.message,
    });
  }
};

export default userProfile;
