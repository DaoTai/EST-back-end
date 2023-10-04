import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  uri: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    default: "image",
  },
  storedBy: {
    type: String,
    default: "",
  },
});

export default AttachmentSchema;
