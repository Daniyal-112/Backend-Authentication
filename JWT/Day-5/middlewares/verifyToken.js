import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Token is missing",
    });
  }
  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifyToken;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired.",
      });
    }
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};

export default verifyToken;
