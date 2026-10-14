import User from "../models/user.js";
import bcrypt from "bcrypt";
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
        message: "Wrong password",
      });
    }
    return res.status(200).json({
      message: "Login Successful",
      name: checkUser.name,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

export default userLogin;
