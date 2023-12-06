import { Router } from "express";
import LessonController from "~/app/controllers/Lesson.controller";
import { uploadVideo } from "~/utils/multer";

const router = Router();

router
  .route("/:idCourse")
  .get(LessonController.getByIdCourse)
  .post(uploadVideo.single("video"), LessonController.create);

router
  .route("/detail/:id")
  .get(LessonController.getById)
  .patch(uploadVideo.single("video"), LessonController.edit)
  .delete(LessonController.delete);

export default router;
