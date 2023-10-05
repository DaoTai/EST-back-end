import fs from "fs";
import path from "path";
import env from "../environment";
export const transformAttachment = (attachment) => {
  if (attachment?.storedBy === "server") {
    attachment.uri = `http://${env.HOST_NAME}:${env.PORT}/${env.STATIC_IMAGES_FOLDER}/${attachment.uri}`;
  }
  return attachment;
};

export const deleteAttachment = async (attachmentName) => {
  if (!attachmentName) return;
  const attachmentPath = path.join(env.IMAGES_SERVER_PATH, attachmentName);
  fs.unlink(attachmentPath, (err) => {
    if (err) {
      console.error("Failed to delete image");
      console.error(err);
    }
  });
};
