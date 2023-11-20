import mongoose from "mongoose";

const GroupChatSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "pending",
    },
    host: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "Host is required"],
    },
    members: {
      type: [{ type: mongoose.Types.ObjectId, ref: "user" }],
      default: [],
    },
    lastestChat: {
      type: mongoose.Types.ObjectId,
      ref: "chat",
    },
  },
  {
    timestamps: true,
  }
);
const GroupChatModel = mongoose.model("group-chat", GroupChatSchema);
export default GroupChatModel;
