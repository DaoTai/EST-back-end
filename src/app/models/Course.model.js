import mongoose from "mongoose";
import { deleteServerAttachment, transformAttachmentUri } from "~/utils/attachment";
import AttachmentSchema from "~/utils/attachment/Schema";
import { deleteImageCloud, uploadImageCloud } from "~/utils/cloudinary";
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
      required: [true, "Thumbnail course is required"],
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
          deleted: this.deleted,
          deletedAt: this.deletedAt,
          thumbnail: transformAttachmentUri(this.thumbnail, "image"),
          roadmap: transformAttachmentUri(this.roadmap, "document"),
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
          deleteServerAttachment(file.filename, "document");
          thumbnail = {
            uri: thumbnailCloud.url,
            storedBy: "cloudinary",
          };
        } catch (error) {
          thumbnail = {
            uri: file.filename,
            storedBy: "server",
          };
        }
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
