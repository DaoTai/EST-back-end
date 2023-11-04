import mongoose from "mongoose";

const AnswerRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    question: {
      type: mongoose.Types.ObjectId,
      ref: "question",
    },
    answers: {
      type: [String],
      require: [true, "User's answers are required"],
      trim: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AnswerRecordModel = mongoose.model("answer-record", AnswerRecordSchema);
export default AnswerRecordModel;
