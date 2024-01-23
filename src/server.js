import cors from "cors";
import express from "express";
import path from "path";
import { createServer } from "http";
import { handlingErrorMiddleware } from "~/app/middlewares";
import connectDB from "~/config/mongodb";
import route from "~/routes";
import env from "~/utils/environment";
import Socket from "./services/Socket.service";
import { corsOptions } from "./config/cors";

const PORT = env.LOCAL_DEV_APP_PORT || 8000;
const LOCAL_DEV_HOST_NAME = env.LOCAL_DEV_HOST_NAME;
// Cấu hình đường dẫn tĩnh cho thư mục public
const publicPath = path.join(__dirname, "public");
// Run
(() => {
  const app = express();
  // Socket
  const httpServer = createServer(app);
  const socket = new Socket(httpServer);
  socket.run();
  // Apply middlewares
  app.use(express.static(publicPath));

  app.use(cors(corsOptions));
  // app.use(cors());
  app.use(express.json({ limit: "900mb" }));
  app.use(express.urlencoded({ extended: true, limit: "900mb" }));

  // Connect DB
  connectDB();
  // Routing
  route(app);
  // Middleware handling errors
  app.use(handlingErrorMiddleware);

  // Production environmet in render.com
  if (env.BUILD_MODE === "production") {
    httpServer.listen(process.env.PORT, () => {
      console.log(`Production BE Server is running on ${process.env.PORT}`);
    });
  } else {
    // Dev environment
    httpServer.listen(PORT, LOCAL_DEV_HOST_NAME, () => {
      console.log(`DEV BE Server is running on ${LOCAL_DEV_HOST_NAME}:${PORT}`);
    });
  }
})();
