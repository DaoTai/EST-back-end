import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";
import { isEmail } from "~/utils/validation";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => isEmail(value),
        message: "Email is invalid",
      },
      require: [true, "Email is required field"],
    },
    fullName: {
      type: String,
      trim: true,
      minLength: [2, "Fullname is at least 2 characters"],
      maxLength: [20, "Fullname is maximum 20 characters"],
      require: [true, "Fullname is required field"],
    },
    username: {
      type: String,
      trim: true,
      default: () => this.fullName,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxLength: [300, "Bio is  maximum 300 characters"],
    },
    dob: {
      type: String,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender is invalid",
      },
    },
    hashedPassword: {
      type: String,
      minLength: [6, "Password is at least 6 characters"],
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true, deletedBy: true });

const UserModel = mongoose.model("user", UserSchema);
export default UserModel;
