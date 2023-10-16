import mongoose from "mongoose";
import AttachmentSchema from "~/utils/attachment/Schema";

const LessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Types.ObjectId,
    ref: "course",
    required: [true, "Course is invalid"],
  },
  launching: {
    type: Boolean,
    default: false,
  },
  video: {
    type: AttachmentSchema,
  },
  comment: [
    {
      type: mongoose.Types.ObjectId,
      ref: "lesson-comment",
    },
  ],
  question: [
    {
      type: mongoose.Types.ObjectId,
      ref: "question",
    },
  ],
});

const LessonModel = mongoose.model("lesson", LessonSchema);

export default LessonModel;
