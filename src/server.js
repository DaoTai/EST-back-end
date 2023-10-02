import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "~/utils/environment";
import connectDB from "~/config/mongodb";
import route from "~/routes";
import { handlingErrorMiddleware } from "~/app/middlewares";

const PORT = env.PORT || 8000;
const HOST_NAME = "localhost";

// Run
(() => {
  const app = express();
  // Apply middlewares
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  // Connect DB
  connectDB();
  // Routing
  route(app);
  // Middleware handling errors
  app.use(handlingErrorMiddleware);
  app.listen(PORT, HOST_NAME, () => {
    console.log(`Server is running on ${HOST_NAME}:${PORT}`);
  });
})();
