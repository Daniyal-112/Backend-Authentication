import Users from "../models/user.js";
const getAllUSers = async (req, res) => {
  try {
    const usersData = await Users.find().select("name email -_id");
    if (usersData.length === 0) {
      return res.status(200).json({
        message: "User list is empty",
        usersData: [],
      });
    }
    return res.status(200).json({
      message: "Users fetch successful.",
      usersData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};
export default getAllUSers;
