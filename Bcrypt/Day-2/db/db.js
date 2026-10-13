import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`DataBase Connected Successfully`);
  } catch (error) {
    console.log(`DataBase Not Connected ${error.message}`);
  }
};
connectDB();