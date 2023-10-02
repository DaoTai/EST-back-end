import authRoute from "./auth.route";
import userRoute from "./user.route";
import { verifyTokenMiddleware } from "~/app/middlewares";

const route = (app) => {
  app.use("/auth", authRoute);
  app.use("/user", verifyTokenMiddleware, userRoute);
};

export default route;
