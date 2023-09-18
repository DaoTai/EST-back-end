import mongoose from "mongoose";
import { env } from "../utils/environment";
const connectDB = () => {
  try {
    mongoose.connect(env.MONGODB_URI);
    console.log("Connect to DB successfully!!");
  } catch (err) {
    throw Error("Connect to DB failed");
  }
};

export default connectDB;
