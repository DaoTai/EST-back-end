import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "src/public/images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 150);
    return cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
export const upload = multer({ storage: storage });
