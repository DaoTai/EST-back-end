import { Router } from "express";
import LessonController from "~/app/controllers/Lesson.controller";
import { uploadVideo, uploadVideoByMemory } from "~/utils/multer";

const router = Router();

router
  .route("/detail/:id")
  .get(LessonController.getById)
  .patch(uploadVideo.single("video"), LessonController.edit)
  .delete(LessonController.delete);

router
  .route("/:idCourse")
  .get(LessonController.getByIdCourse)
  .post(uploadVideo.single("video"), LessonController.create);
export default router;
