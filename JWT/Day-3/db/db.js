import mongoose from "mongoose";

const connectDB = async (params) => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log(`DataBase Connected`);
};

export default connectDB;
