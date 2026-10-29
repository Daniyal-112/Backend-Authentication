import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Server Startup Failed`);
    console.log(error.message);
    process.exit(1);
  }
};

startServer();
