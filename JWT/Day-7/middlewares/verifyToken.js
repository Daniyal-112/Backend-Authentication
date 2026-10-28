import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Access token is missing",
    });
  }
  try {
    const verifyToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = verifyToken;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token has expired. Please login again",
      });
    }
    return res.staus(401).json({
      message: "Invalid access token",
    });
  }
};

export default verifyToken;
