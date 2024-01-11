import express from "express";
import UserController from "~/app/controllers/User.controller";
import { uploadImage } from "~/utils/multer";

const router = express.Router();
router.get("/profile", UserController.searchProfile);
router.patch("/profile", uploadImage.single("avatar"), UserController.editProfile);
router.get("/profile/:id/created-courses", UserController.getCreatedCoursesByTeacher);
router.get("/profile/:id", UserController.getProfile);
router.patch("/change-password", UserController.changePassword);
router.get("/courses", UserController.getOwnerCourses);
router
  .route("/courses/:id")
  .get(UserController.getOwnerCourse)
  .post(UserController.registerCourse)
  .patch(UserController.rateCourse)
  .delete(UserController.cancelCourse);

router.get("/lessons", UserController.getLessons);
// Reports
router.post("/lessons/:id/reports", UserController.reportLesson);
router.delete("/lessons/:id/reports/:idReport", UserController.deleteReportLesson);
// Comments
router
  .route("/lessons/:id/comments")
  .get(UserController.getCommentsLesson)
  .post(UserController.commentLesson);
router
  .route("/lessons/:id/comments/:idComment")
  .patch(UserController.editCommentLesson)
  .delete(UserController.deleteCommentLesson);

router.get("/lessons/:id", UserController.getLesson);
router.get("/questions/self-train", UserController.selfTrainQuestions);
router.post("/questions/:id", UserController.answerQuestion);
router.get("/predict", UserController.predict);
export default router;
