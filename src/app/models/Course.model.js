import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";
const CourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name course is required"],
      minLength: [2, "Name course is at least 2 characters"],
      maxLength: [300, "Name course is maximum 300 characters"],
    },
    category: {
      type: String,
      required: [true, "Category course is required"],
    },
    consumer: {
      type: String,
      enum: {
        values: ["beginner", "fresher", "junior", "senior", "all"],
        message: "Consumer is invalid",
      },
      default: "all",
    },
    intro: String,
    type: {
      type: String,
      enum: {
        values: ["public", "private"],
        message: "Type course is invalid",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved"],
        message: "Status course is invalid",
      },
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "Author is required"],
    },
    members: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    openDate: String,
    closeDate: String,
    roadmap: String,
  },
  {
    timestamps: true,
    methods: {
      getPreview() {
        return {
          _id: this._id,
          name: this.name,
          category: this.category,
          consumer: this.consumer,
          intro: this.intro,
          type: this.type,
          members: this.members,
          openDate: this.openDate,
          closeDate: this.closeDate,
        };
      },
    },
  }
);

CourseSchema.plugin(MongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
});

const CourseModel = mongoose.model("course", CourseSchema);

export default CourseModel;
