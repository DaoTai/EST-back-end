import mongoose from "mongoose";

const QuestionUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    question: {
      type: mongoose.Types.ObjectId,
      ref: "question",
    },
    score: {
      type: Number,
      max: 10,
    },
    comment: {
      type: String,
      trim: true,
    },
    answers: [String],
  },
  {
    timestamps: true,
  }
);

const QuestionUserModel = mongoose.model("question-user", QuestionUserSchema);
export default QuestionUserModel;
