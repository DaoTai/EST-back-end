import express from "express";
import { env } from "./utils/environment";
import connectDB from "./config/mongodb";
import route from "./routes";
const port = env.PORT || 8000;
const hostname = "localhost";

// Run
(() => {
  const app = express();
  connectDB();
  route(app);
  app.listen(port, hostname, () => {
    console.log(`Server is running on ${hostname}:${port}`);
  });
})();
