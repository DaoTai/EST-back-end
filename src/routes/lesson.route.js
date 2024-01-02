import { Router } from "express";
import LessonController from "~/app/controllers/Lesson.controller";
import { uploadVideo } from "~/utils/multer";

const router = Router();

router.post("/detail/:id/edit", uploadVideo.single("video"), LessonController.edit);

router.route("/detail/:id").get(LessonController.getById).delete(LessonController.delete);

router
  .route("/:idCourse")
  .get(LessonController.getByIdCourse)
  .post(uploadVideo.single("video"), LessonController.create);
export default router;
