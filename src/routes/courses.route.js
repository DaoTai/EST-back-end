import { Router } from "express";
import CourseController from "~/app/controllers/Course.controller";

const router = Router();
router.route("/").get(CourseController.search).post(CourseController.create);

router
  .route("/:id")
  .get(CourseController.get)
  .patch(CourseController.edit)
  .delete(CourseController.delete);

router.patch("/:id/restore", CourseController.restore);
router.delete("/:id/destroy", CourseController.destroy);

export default router;
