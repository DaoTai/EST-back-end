import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { deleteServerAttachment, transformAttachmentUri } from "~/utils/attachment";
import AttachmentSchema from "~/utils/attachment/Schema";
import { deleteImageCloud, uploadImageCloud } from "~/utils/cloudinary";
import env from "~/utils/environment";
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
      required: [true, "Email is required field"],
    },
    roles: {
      type: [String],
      required: true,
      enum: ["admin", "teacher", "user"],
      default: ["user"],
    },
    fullName: {
      type: String,
      trim: true,
      minLength: [2, "Full name is at least 2 characters"],
      maxLength: [30, "Full name is maximum 30 characters"],
      required: [true, "Full name is required field"],
    },
    username: {
      type: String,
      trim: true,
      default: function () {
        return this.fullName;
      },
    },
    avatar: {
      type: AttachmentSchema,
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
      minLength: [3, "School name is invalid"],
      maxLength: [80, "School name is so long"],
    },
    city: {
      type: String,
      maxLength: [50, "City is so long"],
    },
    favouriteProrammingLanguages: [
      {
        type: String,
      },
    ],
    hashedPassword: {
      type: String,
      minLength: [6, "HashedPassword is at least 6 characters"],
    },
    provider: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // Methods
    methods: {
      // Encrypt password
      hashPassword(password) {
        if (!password || password.trim().length < 6) return null;
        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(password, salt);
        this.hashedPassword = hashedPassword;
        return hashedPassword;
      },

      // Check valid user password
      isValidPassword(password, hashedPassword) {
        if (!password || !hashedPassword) return false;
        const isValid = bcrypt.compareSync(password, hashedPassword);
        return isValid;
      },

      getAvatar() {
        return transformAttachmentUri(this.avatar, "image");
      },

      // Get infor user: exclude password
      toProfileJSON() {
        return {
          _id: this._id,
          email: this.email,
          roles: this.roles,
          fullName: this.fullName,
          username: this.username,
          avatar: transformAttachmentUri(this.avatar, "image"),
          bio: this.bio,
          dob: this.dob,
          gender: this.gender,
          school: this.school,
          city: this.city,
          provider: this.provider,
          favouriteProrammingLanguages: this.favouriteProrammingLanguages,
          updatedAt: this.updatedAt,
          createdAt: this.createdAt,
        };
      },

      // Get infor user + accessToken + refreshToken
      toAuthJSON() {
        return {
          ...this.toProfileJSON(),
          accessToken: this.generateAccessToken(),
          refreshToken: this.generateRefreshToken(),
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
            expiresIn: "1d",
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

      // Delete avatar
      async deleteAvatar() {
        try {
          if (this.avatar.storedBy === "server") {
            deleteServerAttachment(this.avatar.uri, "image");
          } else {
            await deleteImageCloud(this.avatar);
          }
        } catch (error) {
          throw new Error(error);
        }
      },

      // Generate avatar
      async generateNewAvatar(file) {
        try {
          const imageCloud = await uploadImageCloud(file);

          // Xoá file tạm trong thư mục
          deleteServerAttachment(file.filename, "image");
          return {
            uri: imageCloud.url,
            storedBy: "cloudinary",
          };
        } catch (error) {
          // Trong TH xảy ra lỗi ko lưu trên cloud được thì lưu bằng multer
          return {
            uri: file.filename,
            storedBy: "server",
          };
        }
      },

      // Checking existed user with provider
      async isExistByProvider(email, provider) {
        const isExist = await mongoose.model("user").findOne({
          email,
          provider,
        });
        return !!isExist;
      },

      // Checking existed user with password
      async isExistByPassword(email) {
        const isExist = await mongoose.model("user").findOne({
          email,
          hashedPassword: {
            $exists: true,
          },
        });
        return !!isExist;
      },
    },
  }
);

const UserModel = mongoose.model("user", UserSchema);
export default UserModel;
