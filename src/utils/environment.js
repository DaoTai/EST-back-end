import "dotenv/config";
export const env = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
  NODE_MAILER_USER: process.env.NODE_MAILER_USER,
  NODE_MAILER_PASSWORD: process.env.NODE_MAILER_PASSWORD,
};
