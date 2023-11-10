import mongoose from "mongoose";

const RegisterCourseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: "course",
      required: [true, "Course is required"],
    },
    rating: {
      type: Number,
      max: [5, "Rating is in range 0-5"],
      min: [0, "Rating is in range 0-5"],
    },
    passedLessons: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "lesson",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

RegisterCourseSchema.pre("updateOne", function (next) {
  this.options.runValidators = true;
  next();
});

const RegisterCourseModel = mongoose.model("register-course", RegisterCourseSchema);

export default RegisterCourseModel;
