import mongoose, { Types } from "mongoose";
import MongooseDelete from "mongoose-delete";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "~/utils/environment";
import { isEmail } from "~/utils/validation";
import { transformAttachment, deleteAttachment } from "~/utils/attachment";
import AttachmentSchema from "~/utils/attachment/Schema";
import { uploadImageCloud, deleteImageCloud } from "~/utils/cloudinary";
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
    roles: {
      type: [String],
      require: true,
      enum: ["admin", "teacher", "user"],
      default: ["user"],
    },
    fullName: {
      type: String,
      trim: true,
      minLength: [2, "Full name is at least 2 characters"],
      maxLength: [30, "Full name is maximum 30 characters"],
      require: [true, "Full name is required field"],
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

      // Get infor user: exclude password
      toProfileJSON() {
        return {
          _id: this._id,
          email: this.email,
          roles: this.roles,
          fullName: this.fullName,
          username: this.username,
          avatar: transformAttachment(this.avatar),
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
          _id: this._id,
          email: this.email,
          roles: this.roles,
          fullName: this.fullName,
          username: this.username,
          avatar: transformAttachment(this.avatar),
          bio: this.bio,
          dob: this.dob,
          gender: this.gender,
          school: this.school,
          city: this.city,
          provider: this.provider,
          favouriteProrammingLanguages: this.favouriteProrammingLanguages,
          updatedAt: this.updatedAt,
          createdAt: this.createdAt,
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
            deleteAttachment(this.avatar.uri);
          } else {
            // Get public_id of image on cloudinary
            const lastNameUri = this.avatar.uri.split("/").pop();
            const id = lastNameUri.split(".")[0];
            await deleteImageCloud(id);
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
          deleteAttachment(file.filename);
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
        const isExist = await mongoose.model("User").findOne({
          email,
          provider,
        });
        return !!isExist;
      },

      // Checking existed user with password
      async isExistByPassword(email) {
        const isExist = await mongoose.model("User").findOne({
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

UserSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true, deletedBy: true });

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
