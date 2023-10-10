import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Question content is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ["code", "choice", "multiple-choice"],
        message: "Category is invalid",
      },
      required: [true, "Question category is required"],
    },
    expiredTime: String,
    correctAnswers: [{ type: String, trim: true }],
    explaination: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

const QuestionModel = mongoose.model("question", QuestionSchema);

export default QuestionModel;
