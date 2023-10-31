import mongoose from "mongoose";

const RegisterCourse = new mongoose.Schema(
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
      max: 5,
      min: 0,
    },
    latestLesson: {
      type: mongoose.Types.ObjectId,
      ref: "lesson",
    },
  },
  {
    timestamps: true,
  }
);

const RegisterCourseModel = mongoose.model("course-user", RegisterCourse);

export default RegisterCourseModel;
