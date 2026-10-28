import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_UR);
  console.log(`DataBase Connected Successfully.`);
};

export default connectDB;
