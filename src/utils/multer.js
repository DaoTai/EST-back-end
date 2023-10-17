import multer from "multer";
import env from "./environment";

const storageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, env.IMAGES_SERVER_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 150);
    return cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const storageDocument = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, env.DOCUMENTS_SERVER_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 150);
    return cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const uploadImage = multer({ storage: storageImage });
export const uploadDocument = multer({ storage: storageDocument });
