import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import User from "../models/user.js";

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
        message: "Invalid password",
      });
    }
    const token = generateToken(checkUser);
    return res.status(200).json({
      message: "login successful",
      role: checkUser.role,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

export default userLogin;