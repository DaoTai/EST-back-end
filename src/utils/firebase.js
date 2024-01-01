import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import firebase from "~/config/firebase";
import ApiError from "./ApiError";

// Upload video
export const uploadVideoByFirebase = async (file) => {
  if (!file) {
    throw new ApiError({
      statusCode: 400,
      message: "No file uploaded",
    });
  }
  const metadata = {
    contentType: "video/mp4",
  };
  const id = uuidv4();
  const fileName = file.originalname;
  const filePath = file.path;
  const fileBuffer = fs.readFileSync(filePath);
  const storage = getStorage(firebase);
  const storageRef = ref(storage, `videos/${id}-${fileName}`);

  try {
    const snapshot = await uploadBytesResumable(storageRef, fileBuffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    throw new ApiError({
      statusCode: 500,
      message: "Error upload video",
    });
  } finally {
    fs.unlink(file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting local file:", unlinkErr);
      }
    });
  }
};

// Delete video
export const deleteFirebaseAttachment = async (url) => {
  if (!url) return;
  const storage = getStorage(firebase);
  const urlRef = ref(storage, url);
  try {
    await deleteObject(urlRef);
  } catch (error) {
    console.log("Error: ", error);
    throw new ApiError({
      statusCode: 500,
      message: "Delete video failed",
    });
  }
};
