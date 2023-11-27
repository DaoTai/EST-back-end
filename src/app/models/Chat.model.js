import mongoose from "mongoose";
import SEOSchema from "~/utils/SEO/Schema";
import { deleteServerAttachment } from "~/utils/attachment";
import AttachmentSchema from "~/utils/attachment/Schema";
import { deleteImageCloud, uploadImageCloud } from "~/utils/cloudinary";

// Chưa tính tới phần SEO của tin nhắn nếu có url
const ChatSchema = new mongoose.Schema(
  {
    idGroupChat: {
      type: mongoose.Types.ObjectId,
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
    seo: {
      type: SEOSchema,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    methods: {
      // Upload attachments to cloudinary
      async uploadAttachments(files) {
        if (!Array.isArray(files) || files.length === 0) return;
        const attachments = [];
        for (const file of files) {
          try {
            const imageCloud = await uploadImageCloud(file);
            // New image after uploaded
            const image = {
              uri: imageCloud.url,
              storedBy: "cloudinary",
            };
            attachments.push(image);
          } catch (error) {
            const image = {
              uri: file.filename,
              storedBy: "server",
            };
            attachments.push(image);
          }
          // Delete temporary file in server folder
          deleteServerAttachment(file.filename, "image");
        }
        this.attachments = attachments;
        return attachments;
      },

      // Delete attachments
      async deleteAttachments() {
        const attachments = [...this.attachments];
        console.log("attachments: ", attachments);
        if (attachments && attachments.length > 0) {
          for (const attachment of attachments) {
            if (attachment.storedBy === "server") {
              deleteServerAttachment(attachment.uri, "image");
            } else {
              await deleteImageCloud(attachment);
            }
          }
        }
      },
    },
  }
);

const ChatModel = mongoose.model("chat", ChatSchema);
export default ChatModel;
