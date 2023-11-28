import cors from "cors";
import express from "express";
import path from "path";
import { createServer } from "http";
import { handlingErrorMiddleware } from "~/app/middlewares";
import connectDB from "~/config/mongodb";
import route from "~/routes";
import env from "~/utils/environment";
import Socket from "./services/Socket.service";

const PORT = env.PORT || 8000;
const HOST_NAME = env.HOST_NAME;
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

  app.use(
    cors({
      origin: env.URI_FRONT_END,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect DB
  connectDB();
  // Routing
  route(app);
  // Middleware handling errors
  app.use(handlingErrorMiddleware);
  httpServer.listen(PORT, HOST_NAME, () => {
    console.log(`Server is running on ${HOST_NAME}:${PORT}`);
  });
})();
