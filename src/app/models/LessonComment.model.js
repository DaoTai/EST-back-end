import mongoose from "mongoose";

const LessonCommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    lesson: {
      type: mongoose.Types.ObjectId,
      ref: "lesson",
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Comment is not empty"],
    },
    pin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const LessonCommentModel = mongoose.model("lesson-comment", LessonCommentSchema);

export default LessonCommentModel;
