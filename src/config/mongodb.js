import mongoose from "mongoose";
import env from "../utils/environment";
const connectDB = () => {
  try {
    mongoose.connect(env.MONGODB_URI, {
      dbName: "est-learn",
    });
    console.log("Connect to DB successfully!!");
  } catch (err) {
    throw new Error("Connect to DB failed");
  }
};

export default connectDB;
