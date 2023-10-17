import { Router } from "express";
import LessonController from "~/app/controllers/Lesson.controller";
const router = Router();

router.route("/:idCourse").get(LessonController.getByIdCourse).post(LessonController.create);

router
  .route("/detail/:id")
  .get(LessonController.getById)
  .patch(LessonController.edit)
  .delete(LessonController.delete);

export default router;
