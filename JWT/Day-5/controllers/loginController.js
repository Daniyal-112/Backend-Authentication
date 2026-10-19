import bcrypt from "bcrypt";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import cookieOptions from "../utils/cookieOptions.js";

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const checkuser = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    
    if (!checkuser) {
      return res.status(401).json({
        message: "Invalid Email",
      });
    }
    const checkPassword = await bcrypt.compare(password, checkuser.password);

    if (!checkPassword) {
      return res.status(401).json({
        message: "Wrong password",
      });
    }

    const token = generateToken(checkuser);
    
    // Setting the JWT token in a cookie
    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 15 * 60000,
    });

    return res.status(200).json({
      message: "Login Successfully",
      role: checkuser.role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

export default userLogin;
