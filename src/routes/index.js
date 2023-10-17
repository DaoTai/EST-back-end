import authRoute from "./auth.route";
import userRoute from "./user.route";
import courseRoute from "./courses.route";
import lessonRoute from "./lesson.route";
import visitorRoute from "./visitor.route";
import { verifyTokenMiddleware, verifyTeacherMiddleware } from "~/app/middlewares";

const route = (app) => {
  app.use("/", visitorRoute);
  app.use("/auth", authRoute);
  app.use("/user", verifyTokenMiddleware, userRoute);
  app.use("/courses", [verifyTokenMiddleware, verifyTeacherMiddleware], courseRoute);
  app.use("/lessons", verifyTokenMiddleware, lessonRoute);
};

export default route;
