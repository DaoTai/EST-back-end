import { Router } from "express";
import CourseController from "~/app/controllers/Course.controller";

const router = Router();
router.route("/").get(CourseController.searchCourse).post(CourseController.createCourse);

router
  .route("/:id")
  .get(CourseController.getCourse)
  .patch(CourseController.editCourse)
  .delete(CourseController.deleteCourse);

router.delete("/:id/destroy", CourseController.destroyCourse);

export default router;
