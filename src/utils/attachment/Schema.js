import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema(
  {
    uri: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "image",
    },
    storedBy: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

export default AttachmentSchema;
