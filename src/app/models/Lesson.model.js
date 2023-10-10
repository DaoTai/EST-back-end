import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";
import AttachmentSchema from "~/utils/attachment/Schema";

const VoteSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  rating: {
    type: Number,
    max: 5,
  },
});

const LessonSchema = new mongoose.Schema({
  courseId: {
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
  votes: [VoteSchema],
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
LessonSchema.plugin(MongooseDelete, {
  overrideMethods: true,
});
const LessonModel = mongoose.model("lesson", LessonSchema);

export default LessonModel;
