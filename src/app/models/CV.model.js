import mongoose from "mongoose";
import AttachmentSchema from "~/utils/attachment/Schema";

const CVSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: [true, "Request role is required"],
    },
    text: {
      type: String,
      default: "",
    },
    attachment: AttachmentSchema,
  },
  {
    timestamps: true,
  }
);

const CVModel = mongoose.model("CV", CVSchema);

export default CVModel;
