import express from "express";
import { env } from "~/utils/environment";
import connectDB from "~/config/mongodb";
import route from "~/routes";
import cookieParser from "cookie-parser";

const PORT = env.PORT || 8000;
const HOST_NAME = "localhost";

// Run
(() => {
  const app = express();
  // Apply middlewares
  app.use(express.json());
  app.use(cookieParser());
  connectDB();
  route(app);
  app.listen(PORT, HOST_NAME, () => {
    console.log(`Server is running on ${HOST_NAME}:${PORT}`);
  });
})();
