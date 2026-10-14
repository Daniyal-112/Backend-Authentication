import connectDB from "./db/db.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send({
    message: "API is Working",
  });
});
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};
startServer();
