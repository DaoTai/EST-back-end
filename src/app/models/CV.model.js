import mongoose from "mongoose";

const CVSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    role: {
      type: String,
      required: [true, "Request role is required"],
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Content about CV is required"],
    },
  },
  {
    timestamps: true,
  }
);

const CVModel = mongoose.model("CV", CVSchema);

export default CVModel;
