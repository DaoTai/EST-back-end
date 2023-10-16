import mongoose from "mongoose";
const RatingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    rating: {
      type: Number,
      max: 5,
      min: 0,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const CourseUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: "course",
    },
    rating: {
      type: RatingSchema,
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

const CourseUserModel = mongoose.model("course-user", CourseUserSchema);

export default CourseUserModel;
