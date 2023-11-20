import mongoose from "mongoose";
import AttachmentSchema from "~/utils/attachment/Schema";

// Chưa tính tới phần SEO của tin nhắn nếu có url
const ChatSchema = new mongoose.Schema(
  {
    idGroupChat: {
      type: mongoose.Types.ObjectId,
      ref: "group-chat",
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    message: {
      type: String,
      maxLength: [1000000, "Max length of message is 100000"],
      default: "",
    },
    hasUrl: {
      type: Boolean,
      default: false,
    },
    attachments: [AttachmentSchema],
  },
  {
    timestamps: true,
  }
);
const ChatModel = mongoose.model("group-chat", ChatSchema);
export default ChatModel;
