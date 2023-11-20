import authRoute from "./auth.route";
import userRoute from "./user.route";
import adminRoute from "./admin.route";
import courseRoute from "./courses.route";
import lessonRoute from "./lesson.route";
import visitorRoute from "./visitor.route";
import questionRoute from "./question.route";
import cvRoute from "./cv.route";
import answerRecordRoute from "./answer-record.route";
import {
  verifyTokenMiddleware,
  verifyTeacherMiddleware,
  verifyAdminMiddleware,
} from "~/app/middlewares";

const route = (app) => {
  app.use("/", visitorRoute);
  app.use("/auth", authRoute);
  app.use("/cv", verifyTokenMiddleware, cvRoute);
  app.use("/user", verifyTokenMiddleware, userRoute);
  app.use("/admin", [verifyTokenMiddleware, verifyAdminMiddleware], adminRoute);
  app.use("/courses", [verifyTokenMiddleware, verifyTeacherMiddleware], courseRoute);
  app.use("/answer-records", [verifyTokenMiddleware, verifyTeacherMiddleware], answerRecordRoute);

  app.use("/lessons", [verifyTokenMiddleware, verifyTeacherMiddleware], lessonRoute);
  app.use("/questions", [verifyTokenMiddleware, verifyTeacherMiddleware], questionRoute);
};

export default route;
