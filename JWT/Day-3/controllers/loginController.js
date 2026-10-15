import bcrypt from "bcrypt";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

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
    const token = generateToken(checkUser._id);
    return res.status(200).json({
      message: "Login successful",
      token,
    });
    
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

export default userLogin;
