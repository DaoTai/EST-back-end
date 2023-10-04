import "dotenv/config";
export const env = {
  PORT: process.env.PORT,
  HOST_NAME: process.env.HOST_NAME,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
  NODE_MAILER_USER: process.env.NODE_MAILER_USER,
  NODE_MAILER_PASSWORD: process.env.NODE_MAILER_PASSWORD,
  STATIC_IMAGES_FOLDER: process.env.STATIC_IMAGES_FOLDER,
};
