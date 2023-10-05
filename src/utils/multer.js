import multer from "multer";
import env from "./environment";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, env.IMAGES_SERVER_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 150);
    return cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
export const upload = multer({ storage: storage });
