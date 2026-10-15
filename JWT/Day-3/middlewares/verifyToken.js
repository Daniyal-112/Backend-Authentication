import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Token is missing",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = verifyToken;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired, please login again",
      });
    }
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
export default verifyToken;
