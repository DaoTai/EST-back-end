import mongoose from "mongoose";

const AnswerRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "Required user"],
    },
    question: {
      type: mongoose.Types.ObjectId,
      ref: "question",
      required: [true, "Required question"],
    },
    idRegisteredCourse: {
      // Xử lý gọn khi cancel course + dễ dàng lấy điểm trung bình
      type: String,
      required: [true, "Required idRegisterCourse"],
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
