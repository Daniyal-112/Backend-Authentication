import User from "../models/user.js";

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email");
    return res.status(200).json({
      message: "Users fetched successful",
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users",
      eror: error.message,
    });
  }
};

export default getAllUsers;
