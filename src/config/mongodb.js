import mongoose from "mongoose";
import env from "../utils/environment";
const connectDB = () => {
  try {
    console.log("MongoURI: ", env.MONGODB_URI);
    mongoose.connect(env.MONGODB_URI, {
      dbName: "est-learn",
      useNewUrlParser: "true",
      useUnifiedTopology: "true",
    });
    console.log("Connect to DB successfully!!");
  } catch (err) {
    throw new Error("Connect to DB failed");
  }
};

export default connectDB;
