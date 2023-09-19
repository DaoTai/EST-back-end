import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "~/utils/environment";
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
      unique: true,
    },
    roles: {
      type: [String],
      require: true,
      enum: ["admin", "teacher", "user"],
      default: ["user"],
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
      default: function () {
        return this.fullName;
      },
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
    school: {
      type: String,
      minLength: [3, "Name school is invalid"],
    },
    favouriteProramingLanguages: [
      {
        type: String,
      },
    ],
    hashedPassword: {
      type: String,
      minLength: [6, "Password is at least 6 characters"],
    },
    provider: {
      type: String,
    },
  },
  {
    timestamps: true,
    // Methods
    methods: {
      // Encrypt password
      hashPassword(password) {
        if (!password) return null;
        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(password, salt);
        this.hashedPassword = hashedPassword;
      },

      // Check valid user password
      isValidPassword(password, hashedPassword) {
        const isValid = bcrypt.compareSync(password, hashedPassword);
        return isValid;
      },

      // Get infor user: exclude password
      toAuthJSON() {
        return {
          email: this.email,
          role: this.role,
          fullName: this.fullName,
          username: this.username,
          avatar: this.avatar,
          bio: this.bio,
          dob: this.dob,
          gender: this.gender,
          school: this.school,
          favouriteProramingLanguages: this.favouriteProramingLanguages,
        };
      },

      // Generate access token
      generateAccessToken() {
        return jwt.sign(
          {
            _id: this._id,
            username: this.username,
            roles: this.roles,
          },
          env.JWT_ACCESS_TOKEN,
          {
            expiresIn: "20",
          }
        );
      },

      // Generate refresh token
      generateRefreshToken() {
        return jwt.sign(
          {
            _id: this._id,
            username: this.username,
            roles: this.roles,
          },
          env.JWT_REFRESH_TOKEN,
          {
            expiresIn: "14d",
          }
        );
      },

      // Checking existed email
      async isExistEmail(email) {
        const isExist = await mongoose.model("User").findOne({
          email,
        });
        return !!isExist;
      },
    },
  }
);

UserSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true, deletedBy: true });

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
