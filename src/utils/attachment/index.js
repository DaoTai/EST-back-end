import fs from "fs";
import path from "path";
import env from "../environment";

export const transformImageUri = (attach) => {
  const newAttach = { ...attach };
  if (attach?.storedBy === "server") {
    const uri = env.STATIC_IMAGES_FOLDER;
    newAttach.uri = `http://${env.LOCAL_DEV_HOST_NAME}:${env.LOCAL_DEV_APP_PORT}/${uri}/${attach.uri}`;
  }
  return newAttach;
};

export const transformAttachmentUri = (attachment, type) => {
  if (!attachment || !type) return;
  // Vì tính chất tham chiếu nó sẽ trỏ tới params attachment
  // Khi xảy ra vòng lặp tại chỉ 1 course thì sẽ hoạt động ko mong muốn
  const attach = { ...attachment._doc };
  if (attach?.storedBy === "server") {
    let uri = "";
    switch (type) {
      case "image":
        uri = env.STATIC_IMAGES_FOLDER;
        break;
      case "document":
        uri = env.STATIC_DOCUMENTS_FOLDER;
        break;
      case "video":
        uri = env.STATIC_VIDEOS_FOLDER;
        break;
      default:
        throw new Error("Type is invalid");
    }
    attach.uri = `http://${env.LOCAL_DEV_HOST_NAME}:${env.LOCAL_DEV_APP_PORT}/${uri}/${attach.uri}`;
  }
  return attach;
};

export const deleteServerAttachment = (attachmentName, type) => {
  if (!attachmentName) return;
  let uri = "";
  switch (type) {
    case "image":
      uri = env.IMAGES_SERVER_PATH;
      break;
    case "document":
      uri = env.DOCUMENTS_SERVER_PATH;
      break;
    case "video":
      uri = env.VIDEOS_SERVER_PATH;
      break;
    default:
      throw new Error("Type is invalid");
  }
  const attachmentPath = path.join(uri, attachmentName);
  fs.unlink(attachmentPath, (err) => {
    // Nếu không có lỗi thì err sẽ là null nên cần phải check if
    if (err) {
      console.error(`Failed to delete ${type}`, err);
    }
  });
};
