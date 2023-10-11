import authRoute from "./auth.route";
import userRoute from "./user.route";
import courseRoute from "./courses.route";
import visitorRoute from "./visitor.route";
import { verifyTokenMiddleware, verifyTeacherMiddleware } from "~/app/middlewares";

const route = (app) => {
  app.use("/", visitorRoute);
  app.use("/auth", authRoute);
  app.use("/user", verifyTokenMiddleware, userRoute);
  app.use("/courses", [verifyTokenMiddleware, verifyTeacherMiddleware], courseRoute);
};

export default route;
