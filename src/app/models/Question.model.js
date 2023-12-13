import mongoose from "mongoose";
import { QUESTIONS_CATEGORIES } from "~/utils/constants";

const QuestionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Question content is required"],
      trim: true,
      minLength: [3, "Question is at least 3 characters"],
    },
    category: {
      type: String,
      enum: {
        values: QUESTIONS_CATEGORIES,
        message: "Category is invalid",
      },
      required: [true, "Question category is required"],
    },
    answers: {
      type: [
        {
          type: String,
          trim: true,
          minLength: [1, "Length answer is at least 1 character"],
        },
      ],
      minLength: [2, "Answers are at least 2 answers"],
    },
    correctAnswers: {
      type: [
        {
          type: String,
          trim: true,
          minLength: [1, "Correct answer is not allowed to empty"],
        },
      ],
      minLength: [1, "Answers are at least 1 answer"],
    },
    explaination: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);
QuestionSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  this.options.runValidators = true;
  next();
});

const QuestionModel = mongoose.model("question", QuestionSchema);

export default QuestionModel;
