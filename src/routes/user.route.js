import express from "express";
import UserController from "~/app/controllers/User.controller";
import { uploadImage } from "~/utils/multer";

const router = express.Router();
router.get("/profile", UserController.searchProfile);
router.patch("/profile", uploadImage.single("avatar"), UserController.editProfile);
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
router.get("/lessons/:id", UserController.getLesson);
router.post("/questions/:id", UserController.answerQuestion);
export default router;
