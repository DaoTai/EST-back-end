import mongoose from "mongoose";
import { deleteServerAttachment, transformAttachmentUri } from "~/utils/attachment";
import AttachmentSchema from "~/utils/attachment/Schema";
import { deleteImageCloud, uploadImageCloud } from "~/utils/cloudinary";
import slugify from "~/utils/slugify";
import RegisterCourseModel from "./RegisterCourse.model";

const CourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name course is required"],
      minLength: [2, "Name course is at least 2 characters"],
      maxLength: [300, "Name course is maximum 300 characters"],
    },
    suitableJob: {
      type: String,
      trim: true,
      uppercase: true,
      required: [true, "Suitable job is required"],
    },
    level: {
      type: String,
      enum: {
        values: ["beginner", "fresher", "junior", "senior", "all"],
        message: "Level is invalid",
      },
      default: "all",
      required: [true, "Level is required"],
    },
    intro: {
      type: String,
      default: "",
      maxLength: [700, "Name course is maximum 700 characters"],
    },
    thumbnail: {
      type: AttachmentSchema,
    },
    type: {
      type: String,
      required: [true, "Type course is required"],
      enum: {
        values: ["public", "private"],
        message: "Type course is invalid",
      },
      default: "public",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved"],
        message: "Status course is invalid",
      },
      required: [true, "Status course is required"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "Author is required"],
    },
    slug: {
      type: String,
      unique: true,
      default: function () {
        return slugify(this.name);
      },
    },
    programmingLanguages: {
      type: [
        {
          type: String,
          uppercase: true,
        },
      ],
      default: [],
    },
    openDate: Date,
    closeDate: Date,
    roadmap: AttachmentSchema,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    methods: {
      // Get thumbnail
      getThumbNail() {
        return transformAttachmentUri(this.thumbnail, "image");
      },

      // Get members
      async getMembers() {
        try {
          const idCourse = this._id;
          const registerCourses = await RegisterCourseModel.find({
            course: idCourse,
          }).populate("user", "-hashedPassword");

          const members = registerCourses.map((register) => register.user);
          return members;
        } catch (error) {
          throw new Error(error);
        }
      },
      // Preview for user
      async getPreview() {
        return {
          _id: this._id,
          name: this.name,
          suitableJob: this.suitableJob,
          level: this.level,
          intro: this.intro,
          type: this.type,
          members: await this.getMembers(),
          slug: this.slug,
          openDate: this.openDate,
          closeDate: this.closeDate,
          createdBy: this.createdBy,
          programmingLanguages: this.programmingLanguages,
          createdAt: this.createdAt,
          totalLessons: this.totalLessons,
          thumbnail: transformAttachmentUri(this.thumbnail, "image"),
          roadmap: transformAttachmentUri(this.roadmap, "document"),
        };
      },

      // Detail for teacher
      async getInfor() {
        return {
          ...(await this.getPreview()),
          status: this.status,
          updatedAt: this.updatedAt,
          deleted: this.deleted,
          deletedAt: this.deletedAt,
        };
      },

      // Get roadmap
      createRoadmap(file) {
        const roadmap = {
          uri: file.filename,
          storedBy: "server",
          type: file.mimetype,
        };
        this.roadmap = roadmap;
        return roadmap;
      },

      // Delete roadmap
      deleteRoadmap() {
        this.roadmap && deleteServerAttachment(this.roadmap.uri, "document");
      },

      // Upload thumbnail to cloudinary
      async uploadThumbnail(file) {
        let thumbnail;
        try {
          const thumbnailCloud = await uploadImageCloud(file);
          thumbnail = {
            uri: thumbnailCloud.secure_url,
            storedBy: "cloudinary",
            type: file.mimetype,
          };
        } catch (error) {
          thumbnail = {
            uri: file.filename,
            storedBy: "server",
            type: file.mimetype,
          };
        }
        // Delete temporary file in server folder
        deleteServerAttachment(file.filename, "document");

        this.thumbnail = thumbnail;

        return thumbnail;
      },

      // Delete thumbnail on cloudinary
      async deleteThumbnail() {
        try {
          if (this.thumbnail) {
            this.thumbnail?.storedBy === "server"
              ? deleteServerAttachment(this.thumbnail.uri, "image")
              : await deleteImageCloud(this.thumbnail);
          }
        } catch (error) {
          throw new Error(error);
        }
      },
    },
  }
);

// Validate before update
CourseSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  this.options.runValidators = true;
  next();
});

const CourseModel = mongoose.model("course", CourseSchema);

export default CourseModel;
