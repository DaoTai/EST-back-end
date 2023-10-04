import { env } from "../environment";
export const transformAttachment = (attachment) => {
  if (attachment?.storedBy === "server") {
    attachment.uri =
      "http://" +
      env.HOST_NAME +
      ":" +
      env.PORT +
      "/" +
      env.STATIC_IMAGES_FOLDER +
      "/" +
      attachment.uri;
  }
  return attachment;
};
