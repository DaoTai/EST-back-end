import mongoose from "mongoose";
import AttachmentSchema from "~/utils/attachment/Schema";

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },

    avatar: {
      type: AttachmentSchema,
    },

    field: {
      type: String,
      required: true,
      enum: {
        values: ["lesson-comment", "my-course", "others", "approved-course"],
        message: "Field is invalid",
      },
    },

    endpoint: {
      type: String,
    },

    sender: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },

    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel = mongoose.model("notification", NotificationSchema);
export default NotificationModel;
