import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const token = jwt.sign({ userId: "123" }, process.env.JWT_SECRET, {
  expiresIn: "15m",
});

console.log(token);


