import mongoose from "mongoose";

const GroupChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    host: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "Host is required"],
    },
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
      default: [],
    },
    blockedMembers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
      default: [],
    },
    latestChat: {
      type: mongoose.Types.ObjectId,
      ref: "chat",
    },
    latestReadBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

GroupChatSchema.pre("updateOne", function (next) {
  this.options.runValidators = true;
  next();
});

const GroupChatModel = mongoose.model("group-chat", GroupChatSchema);
export default GroupChatModel;
