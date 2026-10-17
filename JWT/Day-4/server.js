import dotenv from "dotenv";
import app from "./app.js";
import connectDb from "./db/db.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Server startup failed: ${error}`);
    process.exit(1);
  }
};
startServer();
