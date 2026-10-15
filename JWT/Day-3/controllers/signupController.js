import bcrypt from "bcrypt";
import User from "../models/user.js";


const userSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const checkExistingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (checkExistingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "Registration Successful.",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};
export default userSignup;
