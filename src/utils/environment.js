import "dotenv/config";
const env = {
  LOCAL_DEV_APP_PORT: process.env.LOCAL_DEV_APP_PORT,
  LOCAL_DEV_HOST_NAME: process.env.LOCAL_DEV_HOST_NAME,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
  NODE_MAILER_USER: process.env.NODE_MAILER_USER,
  NODE_MAILER_PASSWORD: process.env.NODE_MAILER_PASSWORD,
  STATIC_IMAGES_FOLDER: process.env.STATIC_IMAGES_FOLDER,
  STATIC_DOCUMENTS_FOLDER: process.env.STATIC_DOCUMENTS_FOLDER,
  STATIC_VIDEOS_FOLDER: process.env.STATIC_VIDEOS_FOLDER,
  IMAGES_SERVER_PATH: process.env.IMAGES_SERVER_PATH,
  DOCUMENTS_SERVER_PATH: process.env.DOCUMENTS_SERVER_PATH,
  VIDEOS_SERVER_PATH: process.env.VIDEOS_SERVER_PATH,
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  URI_FRONT_END: process.env.URI_FRONT_END,
  BUILD_MODE: process.env.BUILD_MODE,
};

export default env;
