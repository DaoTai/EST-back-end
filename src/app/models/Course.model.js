import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";
import {
  deleteImageDocAttachment,
  transformImageUri,
  transformDocumentUri,
} from "~/utils/attachment";
import AttachmentSchema from "~/utils/attachment/Schema";
import { uploadImageCloud } from "~/utils/cloudinary";
import slugify from "~/utils/slugify";

const CourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name course is required"],
      minLength: [2, "Name course is at least 2 characters"],
      maxLength: [300, "Name course is maximum 300 characters"],
    },
    category: {
      type: String,
      trim: true,
      required: [true, "Category course is required"],
    },
    consumer: {
      type: String,
      enum: {
        values: ["beginner", "fresher", "junior", "senior", "all"],
        message: "Consumer is invalid",
      },
      default: "all",
    },
    intro: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: AttachmentSchema,
      default: {
        uri: "https://res.cloudinary.com/dunqa7lcz/image/upload/v1697080125/o63sdz2ztvbztiezkt2z.jpg",
        type: "image",
        storedBy: "cloudinary",
      },
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
    members: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    lessons: [{ type: mongoose.Types.ObjectId, ref: "lesson" }],
    openDate: String,
    closeDate: String,
    roadmap: AttachmentSchema,
  },
  {
    timestamps: true,
    methods: {
      // Preview for user
      getPreview() {
        return {
          _id: this._id,
          name: this.name,
          category: this.category,
          consumer: this.consumer,
          intro: this.intro,
          type: this.type,
          members: this.members,
          openDate: this.openDate,
          closeDate: this.closeDate,
        };
      },

      // Detail for teacher
      getInfor() {
        return {
          _id: this._id,
          name: this.name,
          category: this.category,
          consumer: this.consumer,
          intro: this.intro,
          type: this.type,
          status: this.status,
          createdBy: this.createdBy,
          slug: this.slug,
          members: this.members,
          lessons: this.lessons,
          openDate: this.openDate,
          closeDate: this.closeDate,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
          thumbnail: transformImageUri(this.thumbnail),
          roadmap: transformDocumentUri(this.roadmap),
        };
      },

      // Get roadmap
      createRoadmap(file) {
        this.roadmap = {
          uri: file.filename,
          storedBy: "server",
          type: file.mimetype,
        };
      },

      // Upload thumbnail to cloudinary
      async uploadThumbnail(file) {
        try {
          const thumbnailCloud = await uploadImageCloud(file);
          deleteImageDocAttachment(file.filename);
          this.thumbnail = {
            uri: thumbnailCloud.url,
            storedBy: "cloudinary",
          };
        } catch (error) {
          this.thumbnail = {
            uri: file.filename,
            storedBy: "server",
          };
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

CourseSchema.plugin(MongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
});

const CourseModel = mongoose.model("course", CourseSchema);

export default CourseModel;
