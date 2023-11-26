import mongoose from "mongoose";
import { deleteServerAttachment, transformAttachmentUri } from "~/utils/attachment";
import AttachmentSchema from "~/utils/attachment/Schema";
import LessonCommentModel from "./LessonComment.model";

const ReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    content: {
      type: String,
      required: [true, "Content report is required"],
      minLength: [5, "Content report is at least 5 character"],
    },
  },
  {
    timestamps: true,
  }
);
const LessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Types.ObjectId,
      ref: "course",
      required: [true, "Course is required"],
    },
    name: {
      type: String,
      required: [true, "Name lesson is required"],
      trim: true,
      minLength: [3, "Name lesson is least at 3 characters"],
    },

    isLaunching: {
      type: Boolean,
      default: true,
    },
    theory: {
      type: String,
      validate: {
        validator: (val) => typeof val === "string",
        message: "Theory must be string",
      },
    },
    references: {
      type: [
        {
          type: String,
          minLength: [5, "Reference link is least 5 characters"],
        },
      ],
      default: [],
    },
    video: {
      type: AttachmentSchema,
    },
    questions: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "question",
        },
      ],
      default: [],
    },
    reports: [
      {
        type: ReportSchema,
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    methods: {
      getInfor() {
        return {
          _id: this._id,
          course: this.course,
          name: this.name,
          isLaunching: this.isLaunching,
          theory: this.theory,
          references: this.references,
          questions: this.questions,
          reports: this.reports,
          video: transformAttachmentUri(this.video, "video"),
          thumbnail: transformAttachmentUri(this.course.thumbnail, "image"),
        };
      },

      // Create & store video
      async createVideo(file) {
        const video = {
          uri: file.filename,
          storedBy: "server",
          type: file.mimetype,
        };
        this.video = video;
        return video;
      },

      // Delete video
      async deleteVideo() {
        this.video && deleteServerAttachment(this.video.uri, "video");
      },

      // Delete comment
      async deleteComment() {
        const listComments = await LessonCommentModel.find({
          lesson: this._id,
        });
        console.log("listComments: ", listComments);
      },
    },
  }
);

// Validate before update
LessonSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  this.options.runValidators = true;
  next();
});

const LessonModel = mongoose.model("lesson", LessonSchema);

export default LessonModel;
