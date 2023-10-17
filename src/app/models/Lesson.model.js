import mongoose from "mongoose";
import { transformAttachmentUri } from "~/utils/attachment";
import AttachmentSchema from "~/utils/attachment/Schema";
import slugify from "~/utils/slugify";

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
    },
    slug: {
      type: String,
      default: function () {
        return slugify(this.name);
      },
      unique: true,
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
    references: [
      {
        type: String,
        minLength: [5, "Reference link is least 5 characters"],
      },
    ],
    video: {
      type: AttachmentSchema,
    },
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "lesson-comment",
      },
    ],
    questions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "question",
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
          slug: this.slug,
          isLaunching: this.isLaunching,
          theory: this.theory,
          references: this.references,
          comments: this.comments,
          questions: this.questions,
          video: transformAttachmentUri(this.video, "video"),
          thumbnail: transformAttachmentUri(this.course.thumbnail, "image"),
        };
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
