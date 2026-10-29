import User from "../models/user.js";

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email");

    return res.status(200).json({
      message: "Users fetch successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch all users",
    });
  }
};

export default getAllUsers;
