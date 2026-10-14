import User from "../models/user.js";
import bcrypt from "bcrypt";
const userSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 character",
      });
    }
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingUser) {
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
      message: "Registration Successfully",
      user: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

export default userSignup;
